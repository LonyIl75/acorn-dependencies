"use strict"

import * as _acorn from "../index.js"
import privateMethod from "./privateMethod.js"
import {joinCharOfStaticClassElement, getJuNameOrName} from "../julien/_nodeName.js"
import {ju_tt} from "../julien/token/addedKeywordToken.js"

export default function(Parser) {
  const ExtendedParser = privateMethod(Parser)

  const acorn = Parser.acorn || _acorn
  const tt = acorn.tokTypes

  return class extends ExtendedParser {
    _maybeParseFieldValue(field) {
      if (this.eat(tt.eq)) {
        const oldInFieldValue = this._inStaticFieldScope
        this._inStaticFieldScope = this.currentThisScope()
        field.value = this.parseExpression()
        this._inStaticFieldScope = oldInFieldValue
      } else field.value = null
    }

    // Parse fields
    parseClassElement(_constructorAllowsSuper) {
      if (this.options.ecmaVersion < 8 || !this.isContextual(ju_tt.static.label)) {
        return super.parseClassElement.apply(this, arguments)// private method
      }

      const branch = this._branch()
      branch.next()
      if ([tt.name, tt.bracketL, tt.string, tt.num, this.privateIdentifierToken].indexOf(branch.type) == -1 && !branch.type.keyword) {
        return super.parseClassElement.apply(this, arguments)
      }
      if (branch.type == tt.bracketL) {
        let count = 0
        do {
          if (branch.eat(tt.bracketL)) ++count
          else if (branch.eat(tt.bracketR)) --count
          else branch.next()
        } while (count > 0)
      } else branch.next()
      if (branch.type != tt.eq && !branch.canInsertSemicolon() && branch.type != tt.semi) {
        return super.parseClassElement.apply(this, arguments)// private static method
      }

      const node = this.startNode()
      node.static = this.eatContextual(ju_tt.static.label)
      if (node.static) node.ju_name += this.thisExpressionName + joinCharOfStaticClassElement

      if (this.type == this.privateIdentifierToken) {
        this.parsePrivateClassElementName(node)// private field
      } else {
        this.parsePropertyName(node)
      }

      if ((node.key.type === "Identifier" && node.key.name === ju_tt.constructor.label) ||
          (node.key.type === "Literal" && !node.computed && node.key.value === ju_tt.constructor.label)) {
        this.raise(node.key.start, "Classes may not have a field called constructor")
      }
      if ((node.key.name || node.key.value) === "prototype" && !node.computed) {
        this.raise(node.key.start, "Classes may not have a static property named prototype")
      }
      this.enterScope(64 | 2 | 1, getJuNameOrName(node)) // See acorn's scopeflags.js
      this._maybeParseFieldValue(node)
      this.exitScope({...node, type: "PropertyDefinition"})
      this.finishNode(node, "PropertyDefinition")
      this.semicolon()
      return node
    }

    // Parse private static methods
    parsePropertyName(prop, kind) {
      if (prop.static && this.type == this.privateIdentifierToken) {
        this.parsePrivateClassElementName(prop, kind)
      } else {
        super.parsePropertyName(prop, kind)
      }
    }

    // Prohibit arguments in class field initializers
    parseIdent(liberal, isBinding) {
      const ident = super.parseIdent(liberal, isBinding)
      if (this._inStaticFieldScope && this.currentThisScope() === this._inStaticFieldScope && ident.name == "arguments") {
        this.raise(ident.start, "A static class field initializer may not contain arguments")
      }
      return ident
    }
  }
}
