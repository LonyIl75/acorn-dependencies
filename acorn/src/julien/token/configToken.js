import {ju_tt, joinKeyword} from "./addedKeywordToken.js"
import {DescriptionToken, getLabelFromTokenType} from "../../tokentype.js"
import {camelize_joinArrStr} from "../primitives/String.js"

export const str_props = "props" // TODO move
export const str_pos = "pos" // TODO move
export const str_posMap = camelize_joinArrStr([str_pos, "map"]) // TODO move

export const str_program = "program"
export const str_statment = "statement"
export const str_clause = "clause"
export const str_declaration = "declaration"
export const str_expression = "expression"
export const str_filepath = "filepath"

export const str_variableDeclaration = camelize_joinArrStr(["variable", str_declaration])
export const str_expressionStatement = camelize_joinArrStr([str_expression, str_statment])
export const concatStatement = (str) => camelize_joinArrStr([str, str_statment])

const description_statementTokens = {
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.empty), "empty", str_statment).toConcatable(),
    ...new DescriptionToken(str_program, undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.break), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.case), undefined, undefined, getLabelFromTokenType(ju_tt.switch)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.catch), undefined, str_clause).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.continue), undefined, str_statment).toConcatable(),
    ...new DescriptionToken("debugger", undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.default), undefined, str_clause).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.do), undefined, concatStatement(getLabelFromTokenType(ju_tt.while), str_statment)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.else), undefined, str_clause).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.finally), undefined, str_clause).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.for), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(joinKeyword(getLabelFromTokenType(ju_tt.for), getLabelFromTokenType(ju_tt.in)), camelize_joinArrStr([getLabelFromTokenType(ju_tt.for), getLabelFromTokenType(ju_tt.in)])).toConcatable(),
    ...new DescriptionToken(joinKeyword(getLabelFromTokenType(ju_tt.for), getLabelFromTokenType(ju_tt.of)), camelize_joinArrStr([getLabelFromTokenType(ju_tt.for), getLabelFromTokenType(ju_tt.of)])).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.function), undefined, str_declaration).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.if), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.return), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.switch), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.throw), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.try), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.var), str_variableDeclaration).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.const), camelize_joinArrStr(["constant", str_variableDeclaration])).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.while), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.with), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.class), undefined, str_declaration).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.export), undefined, str_statment).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.import), undefined, str_declaration).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.method), undefined, str_declaration).toConcatable()
  }

const description_primitivesTokens = {
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.null)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.undefined)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.true)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.false)).toConcatable()
}

const descriptions_expressionTokens = {
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.new), undefined, str_expressionStatement).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.this), undefined, str_expressionStatement).toConcatable()
}

const descriptions_keywordTokens = {
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.in)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.instanceof)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.typeof)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.void)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.delete)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.extends)).toConcatable(),
    ...new DescriptionToken(getLabelFromTokenType(ju_tt.super)).toConcatable()
}

export const description_tokens = {
    ...description_statementTokens,
    ...description_primitivesTokens,
    ...descriptions_expressionTokens,
    ...descriptions_keywordTokens,
    ...new DescriptionToken("#", "PrivateElement").toConcatable()
}
