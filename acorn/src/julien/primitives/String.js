import {isNotEmptyArray} from "./Array.js"

export const majFirstChar = (str) => str.charAt(0).toUpperCase() + str.slice(1)
export const strEd = (str) => `${str}ed`
export const notStr = (str) => `not${majFirstChar(str)}`

export function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase()
    }).replace(/\s+/g, "")
}

export const camelize_joinArrStr = (arr_args, beginWithMaj = true) => {
    let res_str = ""
    arr_args = arr_args.filter((arg) => arg)
    res_str = arr_args.reduce((acc_str, arg) => acc_str + majFirstChar(arg), res_str)
    if (!beginWithMaj) res_str = res_str[0].toLowerCase() + res_str.slice(1)
    return res_str
}

export const isPrefix = (prefix, str) => {
    return str.startsWith(prefix)
}

export function splitByFirstOccurence(str, separator) {
    let index = str.indexOf(separator)
    return [str.slice(0, index), str.slice(index + 1)]
}

export function isNumeric(str) {
    if (typeof str !== "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  // ARRAY STRING :

export const arrayToString = (paramArr, delimiter = ".") => [!isNotEmptyArray(paramArr) ? "" : paramArr.reduce((acc, elm) => acc + delimiter + elm, "").slice(1), delimiter]
export const stringToArray = (paramStr, delimiter = ".") => paramStr.split(delimiter)
export const joinArray_with_char = (paramArr, paramChar = "") => {
    let _paramArr = paramArr.filter((elm) => elm)
    return arrayToString(_paramArr, paramChar)[0]
}

// OBJECT AND STRING :

export function jsonObjectToString(jsonObject, replacer = null, space = 2) {
    return JSON.stringify(jsonObject, replacer, space)
}
