import {joinArray_with_char} from "../primitives/String.js"

export const regex_charUnionStr = "|"

let ju_escapeRegExp = /[\-(){}\[\]*+?.,\\\^$|#\s]/g // eslint-disable-line no-useless-escape

export class PrefixAndSuffix {
    constructor(prefix = "", suffix = "") {
        this._prefix = prefix
        this._suffix = suffix
    }

    static cstFromObj(obj_prefixAndSuffix) {
        return new PrefixAndSuffix(obj_prefixAndSuffix.prefix, obj_prefixAndSuffix.suffix)
    }

    get prefix() {
        return this._prefix
    }

    get suffix() {
        return this._suffix
    }

    set prefix(prefix) {
        this._prefix = prefix
    }

    set suffix(suffix) {
        this._suffix = suffix
    }

    encloseStr(str) {
        return this.prefix + str + this.suffix
    }
}

export const majMinFirstCharStrRegexp = (_str, flags = undefined) => new RegExp(`[${_str[0].toUpperCase()}${_str[0].toLowerCase()}]${_str.substring(1, _str.length)}`, flags)
export const isBeginWith = (_str, param_regexOrStr, isStr = true) => {
    let regOrStr = regexOrStrToBeginOfLine(addStrToRegexOrStr(param_regexOrStr, new PrefixAndSuffix("", "(.*)"), isStr), isStr)
    return (isStr ? new RegExp(regOrStr) : regOrStr).test(_str)
}

export const regexpToStr = (regexp) => regexp.source

export const concatStrFct = (prefixAndSuffix) => {
    return (str) => prefixAndSuffix.encloseStr(str)
}
export const transformRegexOrStr = (param_regexOrStr, fct_transform_str, isStr = true, flags = undefined) => {
    let res = fct_transform_str(isStr ? param_regexOrStr : regexpToStr(param_regexOrStr))
    return isStr ? res : new RegExp(res, flags || param_regexOrStr.flags)
}

export const addStrToRegexOrStr = (param_regexOrStr, prefixAndSuffix, isStr = true, flags = undefined) => {
    return transformRegexOrStr(param_regexOrStr, concatStrFct(prefixAndSuffix), isStr, flags)
}

export const concatRegExp = (...argsRegExp) => joinRegExpWithJoinStr("", ...argsRegExp)
export const joinRegExpWithJoinStr = (joinStr, ...argsRegExp) => argsRegExp.reduce((acc, elm) => !acc?.source ? elm : addStrToRegexOrStr(elm, new PrefixAndSuffix(acc.source + joinStr), false), "")

export const convertStrToRegExpStr = (paramStr) => paramStr?.replace(ju_escapeRegExp, "\\$&")
export const createRegExp_from_str = (paramStr, strFlags_for_RegExpCst = undefined) => new RegExp(convertStrToRegExpStr(paramStr), strFlags_for_RegExpCst)

export class RegStr {
    constructor(str, flags = undefined) {
        this._str = str
        this._flags = flags
        this._regExp = null
    }

    get str() {
        return this._str
    }

    get flags() {
        return this._flags
    }

    static convertIfNotInstanceOf(str_orRegStr) {
        return str_orRegStr instanceof RegStr ? str_orRegStr : new RegStr(str_orRegStr)
    }

    get regExp() {
        if (!this._regExp) this._regExp = new RegExp(this.str, this.flags)
        return this._regExp
    }
}

const str_beginOfLine_regex = "^"
const str_endOfLine_regex = "$"

export const regexOrStrToBeginOfLine = (param_regexOrStr, isStr = true) => {
    return addStrToRegexOrStr(param_regexOrStr, new PrefixAndSuffix(str_beginOfLine_regex, ""), isStr)
}

export const regexOrStrToEndOfLine = (param_regexOrStr, isStr = true) => {
    return addStrToRegexOrStr(param_regexOrStr, new PrefixAndSuffix("", str_endOfLine_regex), isStr)
}

export const regexOrStrToBeginAndEndOfLine = (param_regexOrStr, isStr = true) => {
    return addStrToRegexOrStr(param_regexOrStr, new PrefixAndSuffix(str_beginOfLine_regex, str_endOfLine_regex), isStr)
}

const prefixAndSuffix_group = new PrefixAndSuffix("(", ")")
const prefixAndSuffix_nonCapturingGroup = new PrefixAndSuffix(prefixAndSuffix_group.prefix + "?:", prefixAndSuffix_group.suffix)

export const regexOrStrToCapturingGroup = (param_regexOrStr, isStr = true) => {
    return addStrToRegexOrStr(param_regexOrStr, prefixAndSuffix_group, isStr)
}

export const regexOrStrToOptional = (param_regexOrStr, isStr = true) => {
    return addStrToRegexOrStr(param_regexOrStr, new PrefixAndSuffix("", "?"), isStr)
}
export const regexOrStrToNonCapturingGroup = (param_regexOrStr, isStr = true) => {
    return addStrToRegexOrStr(param_regexOrStr, prefixAndSuffix_nonCapturingGroup, isStr)
}

export const deleteMatchedStr = (str, regex) => str.replace(regex, "")

export const unionStrRegex = (arr_strRegex) => joinArray_with_char(arr_strRegex, regex_charUnionStr)
export const unionRegex = (arr_regex, joinStr = regex_charUnionStr) => {
    return joinRegExpWithJoinStr(joinStr, ...arr_regex)
}

export class MatchObject {
    static notFoundMatch = null

    constructor(match = null, beg = 0, end = -1) {
        this._match = match
        this._beg = beg
        this._end = end
    }

    get match() {
        return this._match
    }

    get beg() {
        return this._beg
    }

    get end() {
        return this._end
    }

    static isNotFoundMatch(obj) {
        return obj.match === MatchObject.notFoundMatch
    }
}

export const getMatchAndPosFromRegexMatching = (_str, regex, num_groups = [0]) => {
    let res = _str.match(regex)
    let res_arr = []
    if (res) {
        let start_idx = res.index
        let res_group = null
        for (const num_group of num_groups) {
            res_group = res[num_group]
            res_arr.push(res_group ? new MatchObject(res_group, start_idx, start_idx + res_group.length) : MatchObject.notFoundMatch)
        }
    }
    return res_arr
}

export const getMatchAndPosFromRegexMatchingFullMatch = (_str, regex) => getMatchAndPosFromRegexMatching(_str, regex, [0])[0]
export const getArrMatchFromRegexMatching = (_str, regex, num_groups = [0]) => getMatchAndPosFromRegexMatching(_str, regex, num_groups).map((elm) => elm.match)

export const replaceEnclosingCharIfExist = (paramStr, paramPairsEnclosingChars, paramPairChars) => {
    let [beg_idx, end_idx] = [0, paramStr.length - 1]
    return paramPairsEnclosingChars.some((pair) => new RegExp(pair.openingCharRegExp).test(paramStr[beg_idx]) && new RegExp(pair.closingCharRegExp).test(paramStr[end_idx])) ? paramPairChars.encloseStr(paramStr.substring(beg_idx + 1, end_idx)) : paramStr
}
