import {joinNodeNames, joinNodeNameAndProperties, _getJuNameFromNode} from "./_nodeName.js"
import {createRegExp_from_str, concatRegExp} from "./misc/_regexp.js"
import {boolOrUnknown} from "./boolOrUnknown.js"
import {EnclosingChars} from "./misc/EnclosingChars.js"
import {concatArraysAndRemoveDuplicates, countOfElementThatMatchRegExpInArray} from "./primitives/Array.js"
import {strArrToFieldName} from "./primitives/Object.js"
import {DeclAndDepObject} from "./DeclAndDep/DeclAndDepObject.js"
import {isUndefined} from "./primitives/primitive.js"
// ITH CONTEXT :

let contextPairEnclosingChar = new EnclosingChars("[", "]")

export const appendSuffixContext = (_name, _context, str_num_context, autotrim = true) => {
    let prefix = _context + (isUndefined(str_num_context) ? "" : contextPairEnclosingChar.encloseStr(str_num_context))
    return !autotrim ? joinNodeNameAndProperties(_name, prefix) : !_name ? prefix : joinNodeNameAndProperties(_name, prefix)
}

export const ithContextRegExp = contextPairEnclosingChar.encloseRegexp(/\d+/)

export const matchAllExceptLastSuffix = (suffix = ithContextRegExp) => new RegExp(`(.+)${suffix.source}\\s*$`)

export function isContext(str) {
    return matchAllExceptLastSuffix().test(str)
}

export function getIthContextSuffix(_this, context_1, _name, obj, prop) {
    // let context_1 = context  ?  context : starttype.keyword
    let keys = []
    if (!obj) {
        obj = _this[strArrToFieldName("createDeclAndDepFromObj", _this.abrev_currDeclAndDep)](prop)
        keys = DeclAndDepObject.keysOf(obj)
    } else {
        keys = Object.keys(obj, prop)
    }
    let src_beg_reg = _name
    if (_name === undefined || _name === null) {
        src_beg_reg = context_1
        _name = ""
    } else {
        src_beg_reg = joinNodeNames(_name, context_1)
    }
    let beg_reg = createRegExp_from_str(src_beg_reg)
    let reg = new RegExp("^" + concatRegExp(beg_reg, ithContextRegExp).source + "$")
    let setOfKeys_in_DepsAndDeclarations = concatArraysAndRemoveDuplicates(keys)
    let str_num_context = countOfElementThatMatchRegExpInArray(setOfKeys_in_DepsAndDeclarations, reg).toString()
    return [appendSuffixContext(_name, context_1, str_num_context), str_num_context]
}

export function getCurrentContextSuffix(obj, context_1, name) {
    let l = getIthContextSuffix(obj, context_1, name)
    let _name = l[0]
    let num = l[1]
    let decr_num = parseInt(num)
    if (decr_num <= 0) return [_name, num]
    let res_name = removeContextSuffixFromIthContextStr(_name, context_1, num)
    let str_num_context = (decr_num - 1).toString()
    return [appendSuffixContext(res_name, context_1, str_num_context), str_num_context]
}

// str_num_context : match pattern \[\d+\]
export function removeContextSuffixFromIthContextStr(_name, _context, str_num_context) {
    let contextSuffix = createRegExp_from_str(appendSuffixContext("", _context, str_num_context, false))
    return _name.replace(matchAllExceptLastSuffix(contextSuffix), "\$1")// eslint-disable-line no-useless-escape
}

export function removeLastContextSuffix(_strParam) {
    return _strParam.replace(matchAllExceptLastSuffix(), "\$1")// eslint-disable-line no-useless-escape
}

export function getJuNameFromNode(obj, node, _name, litteralTreatment = false) {
    let [ju_name, isLitteral] = _getJuNameFromNode(obj, node, litteralTreatment)
    if (ju_name && isLitteral !== null && boolOrUnknown.isUnknown(isLitteral)) {
        ju_name = getIthContextSuffix(obj, ju_name, _name)[0]
    }
    return ju_name
}
