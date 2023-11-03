 function isNull(obj) {
    return obj === null
}
 function isNullOrUndefined(obj) {
    return isNull(obj) || isUndefined(obj)
}

 function isUndefined(_obj) {
    return _obj === undefined
}

export { isNull, isNullOrUndefined, isUndefined }