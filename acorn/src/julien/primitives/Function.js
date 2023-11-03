// FUNCTION :

export const isFunction = (varToCheck) => {
    return varToCheck && {}.toString.call(varToCheck) === "[object Function]"
}

export function fct_nothing(...args) {

}

export function fct_id(arg) { return arg }

// BOOLEAN FUNCTION :

export function emptyCond(...args) {
    return true
}

export function firstVerifCondArg(cond, ...args) {
    return args.find((elm) => cond(elm))
}

export function firstNotNullArg(...args) {
    return firstVerifCondArg((elm) => elm, ...args)
}

export function getFirstNotNullFctResult(arg_obj, ...fcts) {
    for (const fct of fcts) {
        let res = fct(arg_obj)
        if (res) return res
    }
}
