// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design

import {Parser} from "./state.js"
import {getLabelFromTokenType} from "./tokentype.js"
import {types as tt} from "./mapTokentype.js"
import {lineBreak} from "./whitespace.js"
import {ju_tt} from "./julien/token/addedKeywordToken.js"

export class TokContext {
  constructor(token, isExpr, preserveSpace, override, generator) {
    this.token = token
    this.isExpr = !!isExpr
    this.preserveSpace = !!preserveSpace
    this.override = override
    this.generator = !!generator
  }
}

export const types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, p => p.tryReadTemplateToken()),
  f_stat: new TokContext(tt._function.label, false),
  f_expr: new TokContext(tt._function.label, true),
  f_expr_gen: new TokContext(tt._function.label, true, false, null, true),
  f_gen: new TokContext(tt._function.label, false, false, null, true)
}

const pp = Parser.prototype

pp.initialContext = function() {
  return [types.b_stat]
}

pp.curContext = function() {
  return this.context[this.context.length - 1]
}

pp.braceIsBlock = function(prevType) {
  let parent = this.curContext()
  if (parent === types.f_expr || parent === types.f_stat)
    return true
  if (prevType === tt.colon && (parent === types.b_stat || parent === types.b_expr))
    return !parent.isExpr

  // The check for `tt.name && exprAllowed` detects whether we are
  // after a `yield` or `of` construct. See the `updateContext` for
  // `tt.name`.
  if (prevType === tt._return || prevType === tt.name && this.exprAllowed)
    return lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof || prevType === tt.parenR || prevType === tt.arrow)
    return true
  if (prevType === tt.braceL)
    return parent === types.b_stat
  if (prevType === tt._var || prevType === tt._const || prevType === tt.name)
    return false
  return !this.exprAllowed
}

pp.inGeneratorContext = function() {
  for (let i = this.context.length - 1; i >= 1; i--) {
    let context = this.context[i]
    if (context.token === getLabelFromTokenType(tt._function))
      return context.generator
  }
  return false
}

pp.updateContext = function(prevType) {
  let update, type = this.type
  if (type.keyword && prevType === tt.dot)
    this.exprAllowed = false
  else if (update = type.updateContext)
    update.call(this, prevType)
  else
    this.exprAllowed = type.beforeExpr
}

// Used to handle edge cases when token context could not be inferred correctly during tokenization phase

pp.overrideContext = function(tokenCtx) {
  if (this.curContext() !== tokenCtx) {
    this.context[this.context.length - 1] = tokenCtx
  }
}

// JU ADD :
// each time we change context of acorn we change our("ju") contextPosition
export function ju_updateContext(obj, popOrPush, ...args) {
  if (!["pop", "push"].includes(popOrPush)) throw new Error(`popOrPush must be pop or push not ${popOrPush}`)
  let out = obj.context[popOrPush](...args)
  obj.contextPosition[popOrPush](...args)
  return out
}
// Token-specific context update code

tt.parenR.updateContext = tt.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true
    return
  }
  let out = ju_updateContext(this, "pop")

  if (out === types.b_stat && this.curContext().token === getLabelFromTokenType(tt._function)) {
    out = ju_updateContext(this, "pop")
  }
  this.exprAllowed = !out.isExpr
}

tt.braceL.updateContext = function(prevType) {
  ju_updateContext(this, "push", this.braceIsBlock(prevType) ? types.b_stat : types.b_expr)
  this.exprAllowed = true
}

tt.dollarBraceL.updateContext = function() {
  ju_updateContext(this, "push", types.b_tmpl)
  this.exprAllowed = true
}

tt.parenL.updateContext = function(prevType) {
  let statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while

  ju_updateContext(this, "push", statementParens ? types.p_stat : types.p_expr)

  this.exprAllowed = true
}

tt.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
}

tt._function.updateContext = tt._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== tt._else &&
      !(prevType === tt.semi && this.curContext() !== types.p_stat) &&
      !(prevType === tt._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
      !((prevType === tt.colon || prevType === tt.braceL) && this.curContext() === types.b_stat)) {
      ju_updateContext(this, "push", types.f_expr)
      } else {
    ju_updateContext(this, "push", types.f_stat)
  }
  this.exprAllowed = false
}

tt.colon.updateContext = function() {
  if (this.curContext().token === getLabelFromTokenType(tt._function)) {
    ju_updateContext(this, "pop")
    this.exprAllowed = true
  }
}

tt.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl) {
    ju_updateContext(this, "pop")
  } else {
    ju_updateContext(this, "push", types.q_tmpl)
  }
  this.exprAllowed = false
}

tt.star.updateContext = function(prevType) {
  if (prevType === tt._function) {
    let index = this.context.length - 1
    if (this.context[index] === types.f_expr)
      this.context[index] = types.f_expr_gen
    else
      this.context[index] = types.f_gen
  }
  this.exprAllowed = true
}

tt.name.updateContext = function(prevType) {
  let allowed = false
  if (this.options.ecmaVersion >= 6 && prevType !== tt.dot) {
    if (this.value === getLabelFromTokenType(ju_tt.of) && !this.exprAllowed ||
        this.value === getLabelFromTokenType(ju_tt.yield) && this.inGeneratorContext())
      allowed = true
  }
  this.exprAllowed = allowed
}
