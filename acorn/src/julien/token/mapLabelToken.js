import {getKeywordId, getLabelFromTokenType} from "../../tokentype.js"
import {types as tt} from "../../mapTokentype.js"
import {description_tokens} from "./configToken.js"
import {ju_tt} from "./addedKeywordToken.js"
import {unionStrRegex, regex_charUnionStr} from "../misc/_regexp.js"

export const allJuttStrKeywords = Object.values(ju_tt).map((tok) => getLabelFromTokenType(tok))
export const isJuttStrKeyword = (str) => allJuttStrKeywords.includes(str)

export const allttKeywords = Object.values(tt).map((tok) => getLabelFromTokenType(tok))
export const isttStrKeyword = (token) => allttKeywords.includes(token)

export const isAKeyword = (str) => isttStrKeyword(str) || isJuttStrKeyword(str)

export const getValuesTypesFromTokenIds = (arr_token_ids, init_obj = {}, arr_tokens = description_tokens) => {
    return arr_token_ids.reduce((_obj, token_id) => {
    let res = null
    for (const id of token_id.split(regex_charUnionStr)) {
        res = arr_tokens[id]
        if (!res) continue
        res = getLabelFromTokenType(res)
        res = tt[res] ? tt[res] : tt[getKeywordId(res)]
        if (res) _obj[id] = {...res}
    }
    return _obj
}, init_obj)
}

// All token that have body and is named
const arrScopeType = getValuesTypesFromTokenIds(["ProgramStatement", "FunctionDeclaration", "FunctionExpression|FunctionDeclaration", "ClassDeclaration", "ClassExpression|ClassDeclaration"], {
    StaticBlock: ju_tt.static,
    BlockStatement: tt.braceL
})

export const arrIndexableType = getValuesTypesFromTokenIds(["TryStatement", "CatchClause", "DoWhileStatement", "WhileStatement", "ForStatement", "ForInStatement", "ForOfStatement", "IfStatement", "SwitchCase", "SwitchStatement", "ThrowStatement", "WithStatement"])
// "ObjectExpression" : tt.braceL,
export const indexableTypeKeys = Object.keys(arrIndexableType)
export const indexableTypeKeysTypeValuesLabel = Object.values(indexableTypeKeys).map((tok) => getLabelFromTokenType(tok))
export const isIndexableTypeLabel = (name) => {
    return !name ? false : indexableTypeKeysTypeValuesLabel.includes(name)
}

export const arrIdentifierToken = [
    "Identifier",
    // "PrivateIdentifier",
    // "ThisExpression",
    // "NewExpression",
    "MemberExpression",
    "MetaProperty",
    // "ImportExpression",
    // "ExportAllDeclaration",
    // "ExportDefaultDeclaration",
    // "ExportNamedDeclaration",
    // "ImportDeclaration",
    "ImportExpression",
    // "ImportSpecifier",
    // "ImportDefaultSpecifier",
    "ChainExpression",
    "CallExpression",
    "NewExpression"

]

export const declarationStatement = ["FunctionDeclaration", "VariableDeclaration", "ConstantVariableDeclaration", "ClassDeclaration", "MethodDefinition"]// , "ExportNamedDeclaration","ExportAllDeclaration", "ImportDeclaration" , // "MethodDefinition"
export const isDeclarationStatement = (str) => declarationStatement.includes(str)

export const declarationType = getValuesTypesFromTokenIds(declarationStatement)

// export const declarationTypeKeys = Object.keys(declarationType)
export const declarationTypeValuesLabel = Object.values(declarationType).map((tok) => getLabelFromTokenType(tok))

export const isDeclarationTypeLabel = (_type) => declarationTypeValuesLabel.includes(_type)

export const isDeclarationKeyword = (obj, keyword) => {
    return isDeclarationTypeLabel(keyword) || obj.isLet() || obj.isAsyncFunction()
}

export const typeOfExportOrImport = {
    all: getLabelFromTokenType(tt.star),
    declaration: unionStrRegex(declarationTypeValuesLabel),
    default: getLabelFromTokenType(tt._default),
    unknown: "unknown "
  }
