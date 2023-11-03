import {joinArray_with_char} from "./f2.js"

 const regex_charUnionStr = "|"

let ju_escapeRegExp = /[\-(){}\[\]*+?.,\\\^$|#\s]/g // eslint-disable-line no-useless-escape

 function concatRegExp  (...argsRegExp) {
    return argsRegExp.reduce((acc, elm) => !acc?.source ? elm : new RegExp(acc.source + elm.source), "")
}
 function convertStrToRegExpStr  (paramStr) { return paramStr?.replace(ju_escapeRegExp, "\\$&") }
 function createRegExp_from_str (paramStr, strFlags_for_RegExpCst) { return new RegExp(convertStrToRegExpStr(paramStr), strFlags_for_RegExpCst)}

 function regexToBeginOfLine  (param_regex) {
    return  concatRegExp(/^/, param_regex)
}
 function regexToEndOfLine (param_regex) { return concatRegExp(param_regex, /$/)}
 function regexToBeginAndEndOfLine  (param_regex) { return regexToEndOfLine(regexToBeginOfLine(param_regex))}

 function unionStrRegex  (arr_strRegex) { return joinArray_with_char(arr_strRegex, regex_charUnionStr)}

 class MatchObject {
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

 function getMatchAndPosFromRegexMatching (_str, regex, num_groups = [0]) {
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

 function getMatchAndPosFromRegexMatchingFullMatch  (_str, regex)  { return getMatchAndPosFromRegexMatching(_str, regex, [0])[0]}
 function getArrMatchFromRegexMatching (_str, regex, num_groups = [0])  { return getMatchAndPosFromRegexMatching(_str, regex, num_groups).map((elm) => elm.match)}

 function replaceEnclosingCharIfExist  (paramStr, paramPairsEnclosingChars, paramPairChars)  {
    let [beg_idx, end_idx] = [0, paramStr.length - 1]
    return paramPairsEnclosingChars.some((pair) => new RegExp(pair.openingCharRegExp).test(paramStr[beg_idx]) && new RegExp(pair.closingCharRegExp).test(paramStr[end_idx])) ? paramPairChars.encloseStr(paramStr.substring(beg_idx + 1, end_idx)) : paramStr
}

export { MatchObject, concatRegExp, convertStrToRegExpStr, createRegExp_from_str, getArrMatchFromRegexMatching, getMatchAndPosFromRegexMatching, getMatchAndPosFromRegexMatchingFullMatch, regexToBeginAndEndOfLine, regexToBeginOfLine, regexToEndOfLine, replaceEnclosingCharIfExist, unionStrRegex }
