import {isNullOrUndefined} from "./f4.js"

 function valOrUndefinedIfOutOfScope(arr, idx) {
    return idx >= arr.length ? undefined : arr[idx]
}

 function concatArraysAndRemoveDuplicates  (...argsArrays) {
    return Array.from(new Set(argsArrays.reduce((acc, elm) => acc.concat(elm), [])))
}
 function countOfElementThatMatchRegExpInArray (paramArray, paramRegExp) {
    return  paramArray.reduce((acc, elm) => (paramRegExp.test(elm) ? acc + 1 : acc), 0)
}

// ARRAY :

function lastElementOfArray(arr) {
    return arr[arr.length - 1]
}

 function isNotEmptyArray(arr) {
    return !isNullOrUndefined(arr) && arr.length > 0
}

export {concatArraysAndRemoveDuplicates, countOfElementThatMatchRegExpInArray, isNotEmptyArray, lastElementOfArray, valOrUndefinedIfOutOfScope}