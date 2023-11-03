import {replaceEnclosingCharIfExist, convertStrToRegExpStr, regexToBeginAndEndOfLine , getMatchAndPosFromRegexMatchingFullMatch} from "./f1.js"


import {isNullOrUndefined} from "./lib/f4.js"

 function isFunction  (varToCheck) {
    return varToCheck && {}.toString.call(varToCheck) === "[object Function]"
}


 function enclosingChars_openingChars(arr_enclosingChars) {
    return arr_enclosingChars.map((enclosingChars) => enclosingChars.openingChar)
}

 function enclosingChars_closingChars(arr_enclosingChars) {
    return arr_enclosingChars.map((enclosingChars) => enclosingChars.closingChar)
}

 class EnclosingChars {
    static idx_open = 0
    static idx_close = 1

    constructor(open, close) {
        this._enclosingPairRegExp = ""
        this.enclosingPair = [open, close]
    }

    _toStrRegExp() {
        return this.enclosingPair.map((_str) => convertStrToRegExpStr(_str))
    }

    get openingChar() {
        return this.enclosingPair[EnclosingChars.idx_open]
    }

    get closingChar() {
        return this.enclosingPair[EnclosingChars.idx_close]
    }

    get openingCharRegExp() {
        return this.enclosingPairRegExp[EnclosingChars.idx_open]
    }

    get closingCharRegExp() {
        return this.enclosingPairRegExp[EnclosingChars.idx_close]
    }

    encloseStr(str) {
        return str !== "" && !isNullOrUndefined(str) ? this.openingChar + str + this.closingChar : str
    }

    get enclosingPairRegExp() {
        if (!this._enclosingPairRegExp) this._enclosingPairRegExp = this._toStrRegExp()
        return this._enclosingPairRegExp
    }

    encloseRegexp(regexp, flags) {
        return regexp.source ? new RegExp(this.openingCharRegExp + regexp.source + this.closingCharRegExp, flags || regexp.flags) : regexp.source
    }

    getValueBetweenEnclosingChars(str, fct_change_regexp = regexToBeginAndEndOfLine, getGroupRegex = new RegExp("([^"+this.closingCharRegExp+"]+))")) {
        let replace_regex = this.encloseRegexp(getGroupRegex)
        if (isFunction(fct_change_regexp)) replace_regex = fct_change_regexp(replace_regex)
        return str.replace(this.encloseRegexp(replace_regex), "$1")
    }
}

 const pairsOfEnclosingChars = [
    new EnclosingChars("(", ")"), new EnclosingChars("[", "]"),
    new EnclosingChars("{", "}"), new EnclosingChars("<", ">"), new EnclosingChars("`", "`"),
    new EnclosingChars("'", "'"), new EnclosingChars("\"", "\"")]

 function removeEnclosingChars  (paramStr, paramPairsEnclosingChars) {
    if (!paramPairsEnclosingChars) paramPairsEnclosingChars = pairsOfEnclosingChars
    return replaceEnclosingCharIfExist(paramStr, paramPairsEnclosingChars, new EnclosingChars("", ""))
}


function getMemberFieldRegex (sep = joinCharOfNodeNames, pairsEnclosingChars = pairsOfEnclosingCharForIgnoredSequence)  {
    let arr_enclosingChars = enclosingChars_openingChars(pairsEnclosingChars)
    if (arr_enclosingChars.includes(sep)) throw new Error("sep " + sep +"cannot be in"+ pairsEnclosingChars+ "begin enclosing char")
    let begining_enclosingChar = joinArray_with_char(arr_enclosingChars)
    // ^(?:[^${sep}${begining_enclosingChar}]* , ex "[^.'"`]*" : all not sep or begining_enclosingChar if begining_enclosingChar then match all until end_enclosingChar and repeat till not sep
    return new RegExp("^(?:[^"+sep+begining_enclosingChar+"]*(?:"+getIgnoredSequencesRegex(pairsEnclosingChars)+")?)+")// (?:${joinCharOfNodeNames_regex})?
 }


function isMatchObjectName (_str){
    let res = getMatchAndPosFromRegexMatchingFullMatch(_str, getMemberFieldRegex(joinCharOfNodeNames))
    return !MatchObject.isNotFoundMatch(res) && valOrUndefinedIfOutOfScope(_str, res.end) === joinCharOfNodeNames
 }

 export {EnclosingChars, getMemberFieldRegex, isMatchObjectName, removeEnclosingChars,enclosingChars_closingChars} 