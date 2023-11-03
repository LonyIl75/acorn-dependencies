export function isNull(obj) {
    return obj === null
}
export function isNullOrUndefined(obj) {
    return isNull(obj) || isUndefined(obj)
}

export function isUndefined(_obj) {
    return _obj === undefined
}
