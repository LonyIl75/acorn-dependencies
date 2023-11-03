// ## Token types

import {camelize_joinArrStr} from "./julien/primitives/String.js"

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

export class TokenType {
  constructor(label, conf = {}, description_label = undefined) {
    this.label = label
    this.keyword = conf.keyword
    this.beforeExpr = !!conf.beforeExpr
    this.startsExpr = !!conf.startsExpr
    this.isLoop = !!conf.isLoop
    this.isAssign = !!conf.isAssign
    this.prefix = !!conf.prefix
    this.postfix = !!conf.postfix
    this.binop = conf.binop || null
    this.updateContext = null
    this.description_label = description_label === undefined ? this.label : description_label
  }

  toConcatable() {
    return {[this.description_label]: this}
  }
}

export function binop(name, prec, description_label = undefined) {
  return new TokenType(name, {beforeExpr: true, binop: prec}, description_label)
}
export const beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true}

// Map keyword names to token types.

export const keywords = {}
export const getKeywordId = (_name) => "_" + _name
// Succinct definitions of keyword token types
export function kw(name, options = {}, description_label = undefined) {
  options.keyword = name
  if (description_label === undefined) description_label = getKeywordId(name)
  return keywords[name] = new TokenType(name, options, description_label)
}

// Keyword token types.

export function getLabelFromTokenType(token) {
  return token.label
}

export function getTypeFromTokenType(token) {
  return token.type
}

export function setLabelFromNode(node, label) {
  node.label = label
}

export function getLabelFromNode(node) {
  return node.label
}

export class DescriptionToken {
  static getDfType(_label, suffix = "", prefix = "") {
    return camelize_joinArrStr([prefix, _label, suffix])
  }

  constructor(label, type = undefined, suffix = "", prefix = "") {
    this.label = label
    this.type = (type !== undefined ? DescriptionToken.getDfType(type, suffix, prefix) : type) || DescriptionToken.getDfType(this.label, suffix, prefix)
  }

  static cstFromTokenType(tokentype) {
    return new DescriptionToken(getLabelFromTokenType(tokentype))
  }

  toConcatable() {
    return {[this.type]: this}
  }
}
