import {replaceEnclosingCharIfExist, convertStrToRegExpStr, regexOrStrToBeginAndEndOfLine, regexOrStrToCapturingGroup} from "./_regexp.js"
import {isNullOrUndefined} from "../primitives/primitive.js"
import {isFunction} from "../primitives/Function.js"

export function enclosingChars_openingChars(arr_enclosingChars) {
    return arr_enclosingChars.map((enclosingChars) => enclosingChars.openingChar)
}

export function enclosingChars_closingChars(arr_enclosingChars) {
    return arr_enclosingChars.map((enclosingChars) => enclosingChars.closingChar)
}

export class EnclosingChars {
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

    getValueBetweenEnclosingChars(str, fct_change_regexp = regexOrStrToBeginAndEndOfLine, getGroupRegex = regexOrStrToCapturingGroup(`[^${this.closingCharRegExp}]+`)) {
        let replace_regex = this.encloseRegexp(getGroupRegex)
        if (isFunction(fct_change_regexp)) replace_regex = fct_change_regexp(replace_regex, false)
        return str.replace(this.encloseRegexp(replace_regex), "$1")
    }
}

export const pairsOfEnclosingChars = [
    new EnclosingChars("(", ")"), new EnclosingChars("[", "]"),
    new EnclosingChars("{", "}"), new EnclosingChars("<", ">"), new EnclosingChars("`", "`"),
    new EnclosingChars("'", "'"), new EnclosingChars("\"", "\"")]

export const removeEnclosingChars = (paramStr, paramPairsEnclosingChars) => {
    if (!paramPairsEnclosingChars) paramPairsEnclosingChars = pairsOfEnclosingChars
    return replaceEnclosingCharIfExist(paramStr, paramPairsEnclosingChars, new EnclosingChars("", ""))
}
