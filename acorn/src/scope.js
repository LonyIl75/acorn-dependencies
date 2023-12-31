import {Parser} from "./state.js"
import {SCOPE_VAR, SCOPE_FUNCTION, SCOPE_TOP, SCOPE_ARROW, SCOPE_SIMPLE_CATCH, BIND_LEXICAL, BIND_SIMPLE_CATCH, BIND_FUNCTION} from "./scopeflags.js"
import {ju_exitScope, ju_enterScope} from "./julien/extendsAcorn.js"
import {getJuNameOrNameOrValueProvided} from "./julien/_nodeName.js"

const pp = Parser.prototype

class Scope {
  constructor(flags) {
    this.flags = flags
    // A list of var-declared names in the current lexical scope
    this.var = []
    // A list of lexically-declared names in the current lexical scope
    this.lexical = []
    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
    this.functions = []
    // A switch to disallow the identifier reference 'arguments'
    this.inClassFieldInit = false
  }
}

// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

pp.enterScope = function(flags, ...ju_args) {
  let scope = new Scope(flags)

  ju_enterScope(this, scope, ...ju_args)// JU ADD

  this.scopeStack.push(scope)
}

// JU ADD :
pp.df_exitScope = function() {
  this.scopeStack.pop()
}

pp.exitScope = function(...ju_args) {
  ju_exitScope(this, ...ju_args)// JU ADD
  this.df_exitScope()
}

// The spec says:
// > At the top level of a function, or script, function declarations are
// > treated like var declarations rather than like lexical declarations.
pp.treatFunctionsAsVarInScope = function(scope) {
  return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
}

pp.declareName = function(name, bindingType, pos) {
  let redeclared = false
  if (bindingType === BIND_LEXICAL) {
    const scope = this.currentScope()
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1
    scope.lexical.push(name)
    if (this.inModule && (scope.flags & SCOPE_TOP))
      delete this.undefinedExports[name]
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    const scope = this.currentScope()
    scope.lexical.push(name)
  } else if (bindingType === BIND_FUNCTION) {
    const scope = this.currentScope()
    if (this.treatFunctionsAsVar)
      redeclared = scope.lexical.indexOf(name) > -1
    else
      redeclared = scope.lexical.indexOf(name) > -1 || scope.var.indexOf(name) > -1
    scope.functions.push(name)
  } else {
    for (let i = this.scopeStack.length - 1; i >= 0; --i) {
      const scope = this.scopeStack[i]
      if (scope.lexical.indexOf(name) > -1 && !((scope.flags & SCOPE_SIMPLE_CATCH) && scope.lexical[0] === name) ||
          !this.treatFunctionsAsVarInScope(scope) && scope.functions.indexOf(name) > -1) {
        redeclared = true
        break
      }
      scope.var.push(name)
      if (this.inModule && (scope.flags & SCOPE_TOP))
        delete this.undefinedExports[name]
      if (scope.flags & SCOPE_VAR) break
    }
  }
  if (redeclared) this.raiseRecoverable(pos, `Identifier '${name}' has already been declared`)
}

pp.checkLocalExport = function(id) {
  // scope.functions must be empty as Module code is always strict.
  // JU CHANGE IMP
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
      this.scopeStack[0].var.indexOf(id.name) === -1 &&
      this.scopeStack[0].functions.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id
  }
}

pp.currentScope = function() {
  return this.scopeStack[this.scopeStack.length - 1]
}

pp.getCurrNodeId = function() {
  return getJuNameOrNameOrValueProvided(this.curNode, this.getCurrScopeId())
}
pp.getCurrScopeId = function() {
  return this.currentScope().scopeId
}

pp.currentVarScope = function() {
  for (let i = this.scopeStack.length - 1;; i--) {
    let scope = this.scopeStack[i]
    if (scope.flags & SCOPE_VAR) return scope
  }
}

// Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
pp.currentThisScope = function() {
  for (let i = this.scopeStack.length - 1;; i--) {
    let scope = this.scopeStack[i]
    if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) return scope
  }
}
