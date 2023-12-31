"use strict"

import * as _acorn from "../index.js"
import {ju_tt} from "../julien/token/addedKeywordToken.js"
import {getLabelFromTokenType} from "../tokentype.js"
import {types as tt} from "../mapTokentype.js"
import {description_tokens} from "../julien/token/configToken.js"
import {getJuArgsFromParserThis} from "../julien/_todo.js"

const getPrototype = Object.getPrototypeOf || (o => o.__proto__)

const getAcorn = Parser => {
  if (Parser.acorn) return Parser.acorn

  const acorn = _acorn

  if (acorn.version.indexOf("6.") != 0 && acorn.version.indexOf("6.0.") == 0 && acorn.version.indexOf("7.") != 0) {
    throw new Error(`acorn-private-class-elements requires acorn@^6.1.0 or acorn@7.0.0, not ${acorn.version}`)
  }

  // Make sure `Parser` comes from the same acorn as we `require`d,
  // otherwise the comparisons fail.
  for (let cur = Parser; cur && cur !== acorn.Parser; cur = getPrototype(cur)) {
    if (cur !== acorn.Parser) {
      throw new Error("acorn-private-class-elements does not support mixing different acorn copies")
    }
  }
  return acorn
}

export default function(Parser) {
  // Only load this plugin once.
  if (Parser.prototype.parsePrivateName) {
    return Parser
  }

  const acorn = getAcorn(Parser)

  Parser = class extends Parser {
    _branch() {
      this.__branch = this.__branch || new Parser({ecmaVersion: this.options.ecmaVersion}, this.input, this.pos, getJuArgsFromParserThis(this))
      this.__branch.end = this.end
      this.__branch.pos = this.pos
      this.__branch.type = this.type
      this.__branch.value = this.value
      this.__branch.containsEsc = this.containsEsc
      return this.__branch
    }

    parsePrivateClassElementName(element) {
      element.computed = false
      element.ju_private = true
      if (element.ju_private) element.ju_name += getLabelFromTokenType(description_tokens.PrivateElement)
      element.key = this.parsePrivateName()
      if (element.key.name == "constructor") this.raise(element.key.start, "Classes may not have a private element named constructor")
      const accept = {get: ju_tt.set.label, set: ju_tt.get.label}[element.kind]
      const privateBoundNames = this._privateBoundNames
      if (Object.prototype.hasOwnProperty.call(privateBoundNames, element.key.name) && privateBoundNames[element.key.name] !== accept) {
        this.raise(element.start, "Duplicate private element")
      }
      privateBoundNames[element.key.name] = element.kind || true
      delete this._unresolvedPrivateNames[element.key.name]
      element.ju_name += element.key.name
      return element.key
    }

    parsePrivateName() {
      const node = this.startNode()
      node.name = this.value
      this.next()
      this.finishNode(node, "PrivateIdentifier")
      if (this.options.allowReserved == "never") this.checkUnreserved(node)
      // node.ju_name += node.name
      return node
    }

    // Parse # token
    getTokenFromCode(code) {
      if (code === 35) {
        ++this.pos
        const word = this.readWord1()
        return this.finishToken(this.privateIdentifierToken, word)
      }
      return super.getTokenFromCode(code)
    }

    // Manage stacks and check for undeclared private names
    parseClass(node, isStatement) {
      const oldOuterPrivateBoundNames = this._outerPrivateBoundNames
      this._outerPrivateBoundNames = this._privateBoundNames
      this._privateBoundNames = Object.create(this._privateBoundNames || null)
      const oldOuterUnresolvedPrivateNames = this._outerUnresolvedPrivateNames
      this._outerUnresolvedPrivateNames = this._unresolvedPrivateNames
      this._unresolvedPrivateNames = Object.create(null)

      const _return = super.parseClass(node, isStatement)

      const unresolvedPrivateNames = this._unresolvedPrivateNames
      this._privateBoundNames = this._outerPrivateBoundNames
      this._outerPrivateBoundNames = oldOuterPrivateBoundNames
      this._unresolvedPrivateNames = this._outerUnresolvedPrivateNames
      this._outerUnresolvedPrivateNames = oldOuterUnresolvedPrivateNames
      if (!this._unresolvedPrivateNames) {
        const names = Object.keys(unresolvedPrivateNames)
        if (names.length) {
          names.sort((n1, n2) => unresolvedPrivateNames[n1] - unresolvedPrivateNames[n2])
          this.raise(unresolvedPrivateNames[names[0]], "Usage of undeclared private name")
        }
      } else Object.assign(this._unresolvedPrivateNames, unresolvedPrivateNames)
      return _return
    }

    // Class heritage is evaluated with outer private environment
    parseClassSuper(node) {
      const privateBoundNames = this._privateBoundNames
      this._privateBoundNames = this._outerPrivateBoundNames
      const unresolvedPrivateNames = this._unresolvedPrivateNames
      this._unresolvedPrivateNames = this._outerUnresolvedPrivateNames
      const _return = super.parseClassSuper(node)
      this._privateBoundNames = privateBoundNames
      this._unresolvedPrivateNames = unresolvedPrivateNames
      return _return
    }

    // Parse private element access
    parseSubscript(base, startPos, startLoc, _noCalls, _maybeAsyncArrow, _optionalChained) {
      const optionalSupported = this.options.ecmaVersion >= 11 && acorn.tokTypes.questionDot
      const branch = this._branch()
      if (!(
        (branch.eat(acorn.tokTypes.dot) || (optionalSupported && branch.eat(acorn.tokTypes.questionDot))) &&
        branch.type == this.privateIdentifierToken
      )) {
        return super.parseSubscript.apply(this, arguments)
      }
      let optional = false
      if (!this.eat(acorn.tokTypes.dot)) {
        this.expect(acorn.tokTypes.questionDot)
        optional = true
      }
      let node = this.startNodeAt(startPos, startLoc)
      node.object = base
      node.computed = false
      if (optionalSupported) {
        node.optional = optional
      }
      if (this.type == this.privateIdentifierToken) {
        if (base.type == "Super") {
          this.raise(this.start, "Cannot access private element on super")
        }
        node.property = this.parsePrivateName()
        if (!this._privateBoundNames || !this._privateBoundNames[node.property.name]) {
          if (!this._unresolvedPrivateNames) {
            this.raise(node.property.start, "Usage of undeclared private name")
          }
          this._unresolvedPrivateNames[node.property.name] = node.property.start
        }
      } else {
        node.property = this.parseIdent(true)
      }
      return this.finishNode(node, "MemberExpression")
    }

    // Prohibit delete of private class elements
    parseMaybeUnary(refDestructuringErrors, sawUnary, incDec, forInit) {
      const _return = super.parseMaybeUnary(refDestructuringErrors, sawUnary, incDec, forInit)
      if (_return.operator == tt._delete.label) {
        if (_return.argument.type == "MemberExpression" && _return.argument.property.type == "PrivateIdentifier") {
          this.raise(_return.start, "Private elements may not be deleted")
        }
      }
      return _return
    }
  }
  Parser.prototype.privateIdentifierToken = new acorn.TokenType("privateIdentifier")
  return Parser
}
