import {getLabelFromTokenType} from "../tokentype.js"
import {isBeginWith, regexpToStr, unionRegex, majMinFirstCharStrRegexp, RegStr, regexOrStrToBeginOfLine, regexOrStrToOptional, regexOrStrToCapturingGroup, getArrMatchFromRegexMatching, createRegExp_from_str, convertStrToRegExpStr, replaceEnclosingCharIfExist, unionStrRegex, getMatchAndPosFromRegexMatchingFullMatch, MatchObject, regex_charUnionStr, concatRegExp, regexOrStrToNonCapturingGroup} from "./misc/_regexp.js"
import {boolOrUnknown} from "./boolOrUnknown.js"
import {description_tokens, str_props} from "./token/configToken.js"

import {getterResOrFct, ownProperty, getExtendedFieldValue, joinCharField} from "./primitives/Object.js"
import {firstNotNullArg} from "./primitives/Function.js"
import {joinArray_with_char, isNumeric} from "./primitives/String.js"
import {valOrUndefinedIfOutOfScope} from "./primitives/Array.js"
import {getJuNameFromNode, getIthContextSuffix, ithContextRegExp} from "./_context.js"
import {str_juType} from "./_node.js"
import {types as tt} from "../mapTokentype.js"

import {EnclosingChars, enclosingChars_openingChars, pairsOfEnclosingChars, removeEnclosingChars} from "./misc/EnclosingChars.js"

// TODO-1 : REFACTOR with extendedField :

    // GETTER :

            export function getNameOfNode(node) {
                return node?.name
            }

            export function getJuNameOfNode(node) {
                return node?.ju_name
            }

        export function retJuNameIfExistElseValueProvided(node, providedValue = "", dfBehavior = true) {
            return node?.ju_name ? node.ju_name : dfBehavior && node?.name ? node.name : providedValue
        }

        // GETTER++ :

            export function getJuNameOrName(node) {
                return getterResOrFct(getJuNameOfNode, getNameOfNode, node)
            }

            // get JuNameOrName else fct(node,...args)
            export function getJuNameOrNameOrFct(node, fct, ...args) {
                return getterResOrFct(getJuNameOrName, fct, node, ...args)
            }

            export function getJuNameOrNameOrValueProvided(node, providedValue) {
                return firstNotNullArg(getJuNameOrName(node), providedValue)
            }

 // PATH OF NAME :

 export const joinCharOfStaticClassElement = "_"
 export const joinStaticMember = (...args) => joinArray_with_char(args, joinCharOfStaticClassElement)
 // pattern : `^${string}_`
 export const isMatchStaticObjectName = (name) => new RegExp(`^.+${joinCharOfStaticClassElement}`)?.test(name)

  // get ${string} before _ ( root ) and ${string} after _ ( rest )
  export const getRootAndRestFieldsFromStaticMemberExpression = (str) => {
    let [_bool, beg_pos, end_pos] = isMatchExtendedMember(str, joinCharOfStaticClassElement)
    return _bool ? [str.substring(beg_pos, end_pos), str.substring(end_pos + joinCharOfStaticClassElement.length)] : null
    }

// TODO refactor with regexOrStrToBeginOfLine ect
 export const joinCharOfNodeNames = "."
 export const joinCharOfNodeNames_regex = "\\."
 export const regex_endOrPropOfNodeName = `(?:${joinCharOfNodeNames_regex}|$)`

 export const pairsOfEnclosingCharForIgnoredSequence = [new EnclosingChars("`", "`"), new EnclosingChars("'", "'"), new EnclosingChars("\"", "\"")]
 const getIgnoredSequenceRegex = (pair_enclosing_char) => new RegExp(`(?:${convertStrToRegExpStr(pair_enclosing_char.openingChar)}[^${convertStrToRegExpStr(pair_enclosing_char.closingChar)}]+${convertStrToRegExpStr(pair_enclosing_char.closingChar)})`)
export const getIgnoredSequencesRegex = (pairsEnclosingChars) => unionRegex(pairsEnclosingChars.map((pair) => getIgnoredSequenceRegex(pair)))

 export const getMemberFieldRegex = (str_sep = joinCharOfNodeNames, pairsEnclosingChars = pairsOfEnclosingCharForIgnoredSequence) => {
    let arr_enclosingChars = enclosingChars_openingChars(pairsEnclosingChars)
    if (arr_enclosingChars.includes(str_sep)) throw new Error(`sep ${str_sep} cannot be in ${pairsEnclosingChars} begin enclosing char`)
    let begining_enclosingChar = joinArray_with_char(arr_enclosingChars)
    // ^(?:[^${sep}${begining_enclosingChar}]* , ex "[^.'"`]*" : all not sep or begining_enclosingChar if begining_enclosingChar then match all until end_enclosingChar and repeat till not sep
    return new RegExp(`^(?:[^${convertStrToRegExpStr(str_sep + begining_enclosingChar)}]*(?:${getIgnoredSequencesRegex(pairsEnclosingChars).source})?)+`)// (?:${joinCharOfNodeNames_regex})?
 }

 //
const getMatchAndPosExtendedMember = (_str, str_sep, root_names) => {
    // retrieve (${string|ignoredSeq})(?<=\\.)
    let res = getMatchAndPosFromRegexMatchingFullMatch(_str, getMemberFieldRegex(str_sep))
    if (MatchObject.isNotFoundMatch(res)) return res
    // VERIFY : CHANGE 21/10
    // test if ${string|ignoredSeq} is in root_names
    let _bool = root_names ? (new RegExp(regexOrStrToBeginOfLine(regexOrStrToCapturingGroup(unionStrRegex(root_names.map((name) => convertStrToRegExpStr(name))))))).test(res.match) : res.match != null
    return [_bool, res.beg, res.end]
  }
// return true if _str is a memberExpression and if root_names is not null begin with something in root_names
  export const isMatchExtendedMember = (_str, str_sep, root_names) => {
    let res = getMatchAndPosExtendedMember(_str, str_sep, root_names)
    return res[0]
  }

  // For now 21/10 : property of memberExpression or importExpression
  export const rawPropertyEnclosingChars = new EnclosingChars("\"", "\"")

  // For now 21/10 : type of variableDeclaration , for ex : 'let' then we have var_name['let'] (cf.concatTypeVarAndVarName)
  export const typeEnclosingChars = new EnclosingChars("'", "'")

  // For now 21/10 : use in variableDeclaration
  export const pairSubscriptProperty = new EnclosingChars("[", "]")

  export const subscriptRawPropertyStr = (_str) => {
    return pairSubscriptProperty.encloseStr(rawPropertyEnclosingChars.encloseStr(_str))
  }

  export const subscriptRawPropertyRegex = (_regex) => {
    return pairSubscriptProperty.encloseRegexp(rawPropertyEnclosingChars.encloseRegexp(_regex))
  }

  export const propsRegexp = new RegExp(str_props + regexOrStrToOptional(regexOrStrToNonCapturingGroup(convertStrToRegExpStr(joinCharField) + regexOrStrToCapturingGroup(regexpToStr(/\w+/)))))
  export const isPropsKey = (_str) => propsRegexp.test(_str)

  // For now 21/10 : use in importExpression/Declaration , for ex ["${source.raw}"]
  export const pairCharOfImport = pairSubscriptProperty

  export const concatRegStrAndPropertyRegStr = (prefix_regStr, property_value_regStr) => concatRegExp(prefix_regStr.getRegExp(), subscriptRawPropertyRegex(property_value_regStr.getRegExp()))
  export const concatStringAndPropertyValue = (_str, property_value_str) => _str + subscriptRawPropertyStr(property_value_str)

  export const convertOrDfRegStr = (reg_str, ...args_cst) => reg_str ? RegStr.convertIfNotInstanceOf(reg_str) : new RegStr(...args_cst)

  export const getPropertyValueFromConcatenedStr = (regStr_prefix, concateneted_str, regStr_propValue = undefined) => {
    regStr_propValue = convertOrDfRegStr(regStr_propValue, ".*?")

    regStr_prefix = RegStr.convertIfNotInstanceOf(regStr_prefix)
    let regex_group_value = concatRegStrAndPropertyRegStr(regStr_prefix, regStr_propValue)
    // `^${reg_str.str}\[\"(.*?)\"\]`,"$1"
    let property_value = concateneted_str.replace(regex_group_value, "$1")
    return property_value
  }

  export const concatRegStrAndNodeNameRegStr = (reg_str_prefix, str_sep, reg_str_nodeName) => {
    let regex_group_value = concatRegExp(reg_str_prefix.getRegExp(), createRegExp_from_str(str_sep), reg_str_nodeName.getRegExp())
    return regex_group_value
  }

  export const getNodeNameAndSubPackageName = (concateneted_str, regStr_package_name, str_sep = "", reg_str_nodeName = undefined) => {
    reg_str_nodeName = convertOrDfRegStr(reg_str_nodeName, ".+")

    regStr_package_name = RegStr.convertIfNotInstanceOf(regStr_package_name)

    let regex_group_value = concatRegExp(regexOrStrToCapturingGroup(concatRegExp(regStr_package_name.regExp, ithContextRegExp), false), createRegExp_from_str(str_sep), regexOrStrToCapturingGroup(reg_str_nodeName.regExp, false))
    // `^(${reg_str.str}\[\d+\])${sep}(${reg_str_nodeName})`
    let [packageNameWithNum, nodeName] = getArrMatchFromRegexMatching(concateneted_str, regex_group_value, [1, 2])
    return [packageNameWithNum, nodeName]
  }

  // TODO : not for namespace style function member , eg : let my_obj ={}; (function(obj){ obj["fct"] = function(){}})(my_obj)
  // For now 21/10 : use in variableDeclaration and also member/methodDeclaration inside class
  export const pairCharOfVariableDeclaration = pairSubscriptProperty
  export const concatTypeVarAndVarName = (type_varDecl, varDeclKeyword) => type_varDecl + pairCharOfVariableDeclaration.encloseStr(typeEnclosingChars.encloseStr(varDeclKeyword))

// `${arr[i]}.${arr[i+1]}`
 export const joinNodeNames = (...argsNodesNames) => joinArray_with_char(argsNodesNames, joinCharOfNodeNames)

 // if _str match ${string}.
 export const isMatchObjectName = (_str) => {
    let res = getMatchAndPosFromRegexMatchingFullMatch(_str, getMemberFieldRegex(joinCharOfNodeNames))
    return !MatchObject.isNotFoundMatch(res) && valOrUndefinedIfOutOfScope(_str, res.end) === joinCharOfNodeNames
 }

 // get ${string} before . ( root ) and ${string} after . ( rest )
export const getRootAndRestFieldsFromMemberExpression = (str) => {
    let [_bool, beg_pos, end_pos] = getMatchAndPosExtendedMember(str, joinCharOfNodeNames)
    return _bool ? [str.substring(beg_pos, end_pos), str.substring(end_pos + joinCharOfNodeNames.length)] : null
}

 export const joinCharOfNodeNamesAndProperty = joinCharOfNodeNames
 // return `${str_object} + for i (${sep}properties[i])`
 export const joinNodeNameAndProperties = (_name, ...argsProperties) => argsProperties ? joinArray_with_char([_name, ...argsProperties], joinCharOfNodeNamesAndProperty) : _name

 export const charUnionNodeNames = regex_charUnionStr
// union (aka piped expression ) of all possible names for a node , for ex : `${name_1}|${name_2}|${name_3}`
 export function unionNodeNames(...possibleNamesForNode) {
     return joinArray_with_char(possibleNamesForNode, charUnionNodeNames)
 }
 export const getNodeAlternativeKeyArr = (key) => {
    return key.split(charUnionNodeNames)
 }

 export const ownPropertyNode = (obj, keyName) => {
    return ownProperty(obj, keyName, charUnionNodeNames)
   }

 export function getJuNameAndCtxOfLabelledStatement(obj, node, _name, str_num, token_label) {
    let ju_name = getJuNameFromNode(obj, node, undefined, obj.litteralTreatment)
    let __name = str_num ? _name : ju_name ? _name ? joinNodeNames(_name, ju_name) : ju_name : _name
    if (!str_num) {
      let tmp = getIthContextSuffix(obj, token_label, __name)
      __name = tmp[0]
      str_num = tmp[1]
    }
    return [__name, str_num]
  }

export function _getJuNameFromNode(obj, node, litteralTreatment = false) {
    let ju_name = ""
    let suffix = ""
    let prefix = false
    let res = []
    let fct_join = joinNodeNameAndProperties
    let isLitteralOrIdk = null

    const df_juName_behavior = (node) => node.type

    if (!node) return [ju_name, isLitteralOrIdk]

    ju_name = getJuNameOfNode(node)
    if (ju_name) return [ju_name, isLitteralOrIdk]

    isLitteralOrIdk = boolOrUnknown.getUnSettedValue()
    const next_call = (n_node, n_litteralTreatment = litteralTreatment) => _getJuNameFromNode(obj, n_node, n_litteralTreatment)

    switch (node.type) {
        case "MemberExpression" :
            res = getJuNameOrNameOrFct(node.object, next_call, true)
            let [_name_object, _isLitteralOrIdk1_] = (res instanceof Array) ? [res[0], res[1]] : [res, isLitteralOrIdk]

            res = getJuNameOrNameOrFct(node.property, next_call, false)
            let [_name_property, _isLitteralOrIdk2_] = (res instanceof Array) ? [res[0], res[1]] : [res, isLitteralOrIdk]

            isLitteralOrIdk = _isLitteralOrIdk1_
            ju_name = _name_object
            suffix = _name_property
            if (obj.thisExpressionName && node.object.name === obj.thisExpressionName) fct_join = joinStaticMember

            if (!suffix && node?.property.type === "Litteral") {
                suffix = replaceEnclosingCharIfExist(node.property.raw, pairsOfEnclosingChars, rawPropertyEnclosingChars)
                fct_join = (a, b) => a + b
            }
            break
        case "NewExpression" :
        case "CallExpression" :
            res = getJuNameOrNameOrFct(node.callee, next_call, true)
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            /* suffix = _getJuNameFromNode(obj,node.callee?.property)
            fct_join = joinNodeNameAndProperties */
            break

        case "ChainExpression":
            res = getJuNameOrNameOrFct(node.expression, next_call, true)
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            break
        case "ThisExpression" :
            ju_name = obj.thisExpressionName
            break

        case "MetaProperty":
            res = getJuNameOrNameOrFct(node.meta, next_call, true)
            let [name_object, _isLitteralOrIdk1] = (res instanceof Array) ? [res[0], res[1]] : [res, isLitteralOrIdk]

            res = getJuNameOrNameOrFct(node.property, next_call, true)
            let [name_property, _isLitteralOrIdk2] = (res instanceof Array) ? [res[0], res[1]] : [res, isLitteralOrIdk]

            ju_name = joinNodeNames(name_object, name_property)
            isLitteralOrIdk = _isLitteralOrIdk1
            break

        case "AssignmentExpression":
        case "AssignmentPattern":
            // a = b => {left:node(a) ,right:node(b),...rest}
            res = getJuNameOrNameOrFct(node.left, next_call, true)
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            break

        //! = ExportSpecifier & ImportSpecifier & ImportDefaultSpecifier & ImportNamespaceSpecifier => local + exported

        case "ExportDefaultDeclaration":
        case "ExportNamedDeclaration":
        case "ExportAllDeclaration":
            if (isBeginWith(node.type, majMinFirstCharStrRegexp(getLabelFromTokenType(tt._import)), false)) {
                prefix = getLabelFromTokenType(description_tokens.ImportDeclaration)
                fct_join = concatStringAndPropertyValue
            } else {
                prefix = getLabelFromTokenType(description_tokens.ExportStatement)
            }
            /*
            if(node.type.match('(?:[iI]mport|[eE]xport)Default.+') )){
                res = "default"
            }
            */
            res = getJuNameOrNameOrFct(node.id, next_call, true)
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            break

        case "ImportDeclaration":
        case "ImportExpression" :
            if (isBeginWith(node.type, majMinFirstCharStrRegexp(getLabelFromTokenType(tt._import)), false)) {
                prefix = getLabelFromTokenType(description_tokens.ImportDeclaration)
                fct_join = concatStringAndPropertyValue
            } else {
                prefix = getLabelFromTokenType(description_tokens.ExportStatement)
            }
            /*
            if(node.type.match('(?:[iI]mport|[eE]xport)Default.+') )){
                res = "default"
            }
            */

            res = node.source.type === "Literal" ? getJuNameOrNameOrFct(node.source, next_call, true) : removeEnclosingChars(getExtendedFieldValue(node.source, str_juType), [typeEnclosingChars, rawPropertyEnclosingChars])
            // getJuNameOrNameOrFct(node.source,next_call) //+ (node.source.type == "Literal" ?"": ":" +node.source[str_juType].get())
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            break
        case "WithStatement":
            res = getJuNameOrNameOrFct(node.object, next_call, true)
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            break

        case "LabelledStatement":
            res = getJuNameOrNameOrFct(node.label, next_call, true)
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            break

        case "UpdateExpression" :
        case "UnaryExpression" :
        case "BinaryExpression":
            ju_name = node.operator// _getJuNameFromNode(obj.argument)
            break

        case "TaggedTemplateExpression" :
            res = getJuNameOrNameOrFct(obj.tag, next_call, true)
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            break

        case "Property" :
        case "MethodDefinition":
        case "PropertyDefinition":
            res = getJuNameOrNameOrFct(node.key, next_call, true)
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            break

        case "VariableDeclaration" :
            ju_name = concatTypeVarAndVarName(getJuNameOrNameOrFct(node, (_node) => _node.type), getJuNameOrNameOrFct(node, (_node) => _node.kind))
            return [ju_name, isLitteralOrIdk] // conserver isLitteral == unknow

        case "VariableDeclarator":
        case "ClassDeclaration":
        case "FunctionExpression":
        case "FunctionDeclaration":
        case "ArrowFunctionExpression":
            res = getJuNameOrNameOrFct(node.id, next_call, true)
            if (res instanceof Array) {
                ju_name = res[0]
                isLitteralOrIdk = res[1]
            } else ju_name = res
            break

        case "PrivateIdentifier":
        case "Identifier":
            ju_name = getNameOfNode(node)
            break

        default :
            if (node.type === "Literal") {
                if (litteralTreatment) isLitteralOrIdk = boolOrUnknown.getTrue()
                else isLitteralOrIdk = null
                // else return [ju_name,isLitteralOrIdk]
            }
            // ju_name = getJuNameOrNameOrFct(node,(_node)=>_node.type)
    }
    if (!ju_name) {
        if (isLitteralOrIdk !== null && boolOrUnknown.isTrue(isLitteralOrIdk)) {
            let raw = node.raw
            ju_name = !isNumeric(raw) ? /* camelize( */removeEnclosingChars(raw)/* ) */ : df_juName_behavior(node)
        } else {
            ju_name = df_juName_behavior(node)
            isLitteralOrIdk = boolOrUnknown.getUnSettedValue()
        }
    } else {
        isLitteralOrIdk = boolOrUnknown.getFalse()
        if (prefix) ju_name = fct_join(prefix, ju_name)
        if (suffix) ju_name = fct_join(ju_name, suffix)
    }
    return [ju_name, isLitteralOrIdk]
}
