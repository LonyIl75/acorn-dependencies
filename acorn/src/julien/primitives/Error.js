// ERROR:
export function addCallContextNameToError(curr_contextname, fctCalled, ...args) {
    try {
        return fctCalled(...args)
    } catch (err) {
        err.message = `${curr_contextname} : ${err.message}`
        throw err
    }
}
