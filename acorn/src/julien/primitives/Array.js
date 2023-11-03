import {isNullOrUndefined} from "./primitive.js"

export function valOrUndefinedIfOutOfScope(arr, idx) {
    return idx >= arr.length ? undefined : arr[idx]
}

export const concatArraysAndRemoveDuplicates = (...argsArrays) => Array.from(new Set(argsArrays.reduce((acc, elm) => acc.concat(elm), [])))
export const countOfElementThatMatchRegExpInArray = (paramArray, paramRegExp) => paramArray.reduce((acc, elm) => (paramRegExp.test(elm) ? acc + 1 : acc), 0)

// ARRAY :

function lastElementOfArray(arr) {
    return arr[arr.length - 1]
}

export function isNotEmptyArray(arr) {
    return !isNullOrUndefined(arr) && arr.length > 0
}
