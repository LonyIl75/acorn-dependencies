import {isNullOrUndefined, isUndefined} from "./primitive.js"
import {isPrefix, stringToArray, joinArray_with_char} from "./String.js"
import {emptyCond, isFunction, fct_nothing} from "./Function.js"
import {convertStrToRegExpStr, regex_charUnionStr} from "../misc/_regexp.js"
import {isNotEmptyArray} from "./Array.js"

// PRIMITIVE COND :

export function isObject(val) {
    if (isNullOrUndefined(val)) { return false }
    return ((typeof val !== "function") && !Array.isArray(val) && (typeof val === "object"))
}

// For the following functionS we suppose that obj is an object :

export function isNotEmptyObject(obj) {
    return !isNullOrUndefined(obj) && Object.keys(obj).length > 0
}

function isEmptyObject(obj) {
    return !isNotEmptyObject(obj)
}

export const isSubObjectPathProps = isPrefix

// ARRAY OBJECT
export function concatArrObjects(arr, fct = undefined, init = {}) {
    let reduce_fct = isFunction(fct) ? (acc, elm) => { return {...acc, ...fct(elm)} } : (acc, elm) => { return {...acc, ...elm} }
    return arr.reduce(reduce_fct, init)
}

// Same as lodash pick
export function my_pick(obj, props, init = {}) {
    let notFound_props = []
    let picked_obj = init
    for (const prop of props) {
        if (obj.hasOwnProperty(prop)) picked_obj[prop] = obj[prop]
        else notFound_props.push(prop)
    }
    return [picked_obj, notFound_props]
}

export function ownPropertyRegex(obj, regex) {
    if (isEmptyObject(obj)) return false
    let arr = Object.entries(obj).filter((elm) => regex.test(elm[0]))
    return arr.length ? arr[0] : false
  }

export function ownProperty(obj, keyName, sep_alternativeKey = regex_charUnionStr) {
    let regex = new RegExp("^" + (keyName.split(sep_alternativeKey).map((alternativeKey) => convertStrToRegExpStr(alternativeKey))).join(sep_alternativeKey) + "$")
    return ownPropertyRegex(obj, regex)
  }

// A FAIRE mypick with cond <=>
export function objectElements_notMatch_regex(_object, isMatchFct, sepAtlernativeKeyName = regex_charUnionStr) {
    if (isMatchFct) return Object.entries(_object)?.reduce((_obj, elm) => {
        if (!(elm[0].split(sepAtlernativeKeyName).some(isMatchFct)))_obj[elm[0]] = elm[1]
        return _obj
    }, {})
    else return _object
}

// A FAIRE mypick with cond <=>
export function objectElements_keyVerifyFct(_object, isMatchFct, sepAtlernativeKeyName = regex_charUnionStr) {
    if (isFunction(isMatchFct)) return Object.entries(_object)?.reduce((_obj, elm) => {
        if ((elm[0].split(sepAtlernativeKeyName).some(isMatchFct)))_obj[elm[0]] = elm[1]
        return _obj
    }, {})
    else return _object
}

// VOC : alternative key <=> [`${key1}${sep}${key2}`]:value

// For all entries in _object :
    // if no alternative key {[key] : value}
    // else choose key (fct_key) between alternative key and then recompute value with the choosen key (fct_value)

// A FAIRE REFACTOR : with previous function
export function objectElement_chooseAlternativeKeyWithFct(_object, fct_key = (arr) => [arr[0]], sep = regex_charUnionStr, fct_value = (entry) => entry[1]) {
    return Object.entries(_object)?.reduce((_obj, elm) => {
        let keys_arr = elm[0].split(sep)
        let choosedKey = joinArray_with_char(fct_key(keys_arr), sep)
        _obj[choosedKey] = fct_value([choosedKey, elm[1]])
        return _obj
    }, {})
}

// MISC :

    export function getNumberElementInObject(obj, prop) {
        if (isEmptyObject(obj)) return 0
        if (!prop) return Object.keys(obj).length
        getNumberElementInObject(s_getProp(obj, prop, null), undefined)
    }

    export function _popFirstFieldOfObject(obj) {
        let arr_entries = isObject(obj) ? Object.entries(obj) : []
        let [key, val] = isNotEmptyArray(arr_entries) ? arr_entries[0] : [undefined, undefined]
        if (key) delete obj[key]
        return [key, val]
    }

    export function cstObjectFromEntry(entry) {
        let [key, val] = entry
        return key !== undefined ? {[key]: val} : {}
    }

    export function arrFromObject(obj) {
        return Object.entries(obj).map((elm) => cstObjectFromEntry(elm))
    }

    export function popFirstFieldOfObject(obj) {
        return cstObjectFromEntry(_popFirstFieldOfObject(obj))
    }

// GETTER AND SETTER :

    // GETTER :
        // ret obj[prop] if exist and respect cond by default not empty obj
        export function s_getProp(obj, prop, providedValue = undefined, cond = emptyCond) {
            return cond(obj) && obj?.[prop] ? obj[prop] : providedValue
        }

        // APPLY FUNCTION ON OBJ :
        // apply fct to object if obj verify cond
        export function retFctObjIfNotEmptyElseProvidedValue(obj, fct = (x) => x, providedValue = [], cond = isNotEmptyObject) {
            return cond(obj) ? fct(obj) : providedValue
        }

        // return obj[prop] or init it with initValue (df: {} )
        export function getPropAndInitIfNotExist(obj, prop, initValue = {}) {
            let invalidGet
            let valProp = s_getProp(obj, prop, invalidGet)

            if (valProp === invalidGet) {
                setProp(obj, prop, {...initValue})
                valProp = s_getProp(obj, prop, invalidGet)
            }
            return valProp
        }

    // SETTER :
        export function setProp(obj, prop, value) {
            if (obj) obj[prop] = value
            return obj
        }

        export function replacePropIfExist(obj, prop, value, key) {
            if (obj?.[prop]) {
                if (key) {
                delete obj[prop]
                prop = key
                }
                obj[prop] = value
            }
            return obj
        }

        // add/merge , for ex : obj[prop] ->  {...obj[prop],...value}
        export function setPropAddIfExist(obj, prop, value, addFct = (val, addVal) => { return {...val, ...addVal} }) {
            if (obj?.[prop]) obj[prop] = addFct(obj[prop], value)
            else setProp(obj, prop, value)
            return obj
        }

        // GETTER++:
            // get obj[...propsArray] or invalidValue if one of the props is not defined
            export function getObjectFromPropsArray(obj, propsArray, invalidValue = undefined, fct_get = s_getProp) {
                let getted_obj = obj
                for (let i = 0 ; getted_obj !== invalidValue && i < propsArray.length ; i++) {
                    getted_obj = fct_get(getted_obj, propsArray[i], invalidValue)
                }
                return getted_obj
            }

        // SETTER++:
            // <=> obj[...propsArray] = value  if one of the props is not defined cancel setting
            export function setObjectFromPropsArray(obj, propsArray, value, invalidReturn = undefined, fct_set = setProp, fct_get = undefined) {
                propsArray = propsArray?.filter((elm) => elm)
                if (!isNotEmptyArray(propsArray)) return invalidReturn
                let prop = propsArray.pop()
                let getted_obj = fct_get !== undefined ? getObjectFromPropsArray(obj, propsArray, invalidReturn, fct_get) : getObjectFromPropsArray(obj, propsArray, invalidReturn)
                if (getted_obj === invalidReturn) return invalidReturn
                else return fct_set(getted_obj, prop, value)
            }

            // get obj[...propsArray] if one of the props is not defined then the further elm in propsArray will be {}
            export function getObjectFromPropsArrayAndInitIfNotExist(obj, propsArray, invalidValue = undefined, initValue = {}) {
                propsArray = propsArray?.filter((elm) => elm)
                let getted_obj = obj
                let i = 0
                // A FAIRE use invalidValue
                for (; getted_obj != invalidValue && i < propsArray.length - 1 ; i++) { // eslint-disable-line
                    if (getted_obj === initValue) getted_obj = setProp(getted_obj, propsArray[i], {...initValue})
                    else getted_obj = getPropAndInitIfNotExist(getted_obj, propsArray[i], initValue)
                }
                if (getted_obj === invalidValue) return invalidValue
                return getted_obj
            }

            // obj[...propsArray] = value if one of the props the further are init and the last is set with value
            export function setExtraObjectFromPropsArray(obj, propsArray, value, invalidReturn = undefined, fctSet = setPropAddIfExist) {
                propsArray = propsArray?.filter((elm) => elm)
                if (!isNotEmptyArray(propsArray)) return invalidReturn
                let getted_obj = getObjectFromPropsArrayAndInitIfNotExist(obj, propsArray, invalidReturn)
                if (getted_obj === invalidReturn) return invalidReturn
                fctSet(getted_obj, propsArray[propsArray.length - 1], isNullOrUndefined(value) ? value : {...value})
                return getted_obj
            }

            export function setExtraValueFromPropsArray(obj, propsArray, value, invalidReturn = undefined, fctSet = setPropAddIfExist) {
                propsArray = propsArray?.filter((elm) => elm)
                if (!isNotEmptyArray(propsArray)) return invalidReturn
                let getted_obj = getObjectFromPropsArrayAndInitIfNotExist(obj, propsArray, invalidReturn)
                if (getted_obj === invalidReturn) return invalidReturn
                fctSet(getted_obj, propsArray[propsArray.length - 1], value)
                return getted_obj
            }

            function _setPropOrDeleteIfNotVal(obj, prop, value) {
                if (value) setProp(obj, prop, value)
                else delete obj[prop]
                return obj
            }
            // if propsArray lead to a value then delete it and return the nearest super object otherwise do nothing and return null
            function deletePropIfAny(obj, propsArray) {
                return setObjectFromPropsArray(obj, propsArray, null, _setPropOrDeleteIfNotVal)
            }

            let pathToArrayProps = stringToArray

            // if path describe by propsArrayStr lead to a value delete it else return null
            export function deletePropIfAnyStr(obj, propsArrayStr) {
                return deletePropIfAny(obj, pathToArrayProps(propsArrayStr))
            }

            // Return the value of acc_object[prop] merge with {?[nameOfAdd] : pick(object_toAdd,subsetIds_toAdd)}
            export function mergeObjectWithField(acc_object, props, toAdd_object, toAdd_subsetIds = undefined, toAdd_name = undefined) {
                // toAdd_subsetIds :
                let [res_obj, notFoundIds] = isNotEmptyArray(toAdd_subsetIds) ? my_pick(toAdd_object, toAdd_subsetIds) : [toAdd_object, []]
                if (isNotEmptyArray(notFoundIds)) throw new Error(`ids ${notFoundIds} not found in ${toAdd_object.toString()}`)

                // toAdd_name :
                if (!isUndefined(toAdd_name)) res_obj = {[toAdd_name]: res_obj}

                let field_toMergeWith = getObjectFromPropsArray(acc_object, props, {})
                return {...res_obj, ...field_toMergeWith}
            }

            // https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge?page=1&tab=scoredesc#answer-34749873
            export function mergeDeep(base_obj, add_obj, limit_level = -1, fct_keyverify = null, level = 0) {
                if (limit_level > 0 && level > limit_level) return base_obj
                if (isObject(base_obj) && isObject(add_obj)) for (const key in add_obj) {
                        if ((!isFunction(fct_keyverify) || fct_keyverify(key)) && isObject(add_obj[key])) {
                            if (!base_obj[key]) Object.assign(base_obj, {[key]: add_obj[key]})
                            else mergeDeep(base_obj[key], add_obj[key], limit_level, fct_keyverify, level + 1)
                        } else {
                            Object.assign(base_obj, {[key]: add_obj[key]})
                        }
                    }

                return base_obj
            }
// ------------------------------------------------------------ //

// call the static getter getRes and if it return null call the fct with the obj and args
export function getterResOrFct(getRes, fct, obj, ...args) {
    let res = getRes(obj)
    return res || fct(obj, ...args)
}
// transformFct the property prop of obj
export function setPropTransform(obj, prop, getPropFct, setFct, transformFct, ...args) {
    return setFct(obj, prop, transformFct(getPropFct(obj, prop), ...args))
}

// ************************************************************************************* //

export function getAbreviationOf_propsOrObjName(str, abrev_length = 3) {
    return str.substring(0, abrev_length)
}

// EXTEND
export const joinCharField = "_"
export function strArrToFieldName(...args) {
    return joinArray_with_char(args, joinCharField)
}
export const joinCharFunctionType = "_"
export function strArrToFunctionType(...args) {
    return joinArray_with_char(args, joinCharFunctionType)
}

export const str_get = "get"
export const nameGetMethod = (methodName) => strArrToFunctionType(str_get, methodName)
export function getExtendedField(obj, methodName) {
    return obj[nameGetMethod(methodName)]()
}

export const nameSetMethod = (methodName) => strArrToFunctionType(str_set, methodName)

// ------------------------------------------------------------ //

// call fct with trf_pipeline(_obj) in first argument
function transformPipelineEmbed(trf_pipeline, fct) {
    let res = trf_pipeline
? (_obj, ...args) => {
      return ((obj_after_trf) => {
        return fct(obj_after_trf, ...args)
    })(trf_pipeline(_obj))
    }
: fct

    return res
}

// if _isStatic then return fct ( wich is a function that take obj as first argument ) else return a function that take args (but not obj as first arg)
function staticEmbed(obj, _isStatic, fct) {
    return _isStatic ? fct : (...args) => fct(obj, ...args)
}

/*
    Default Methods :
    if !options?.notMethodNaming concat the fieldName with the methodName (with strArrToFunctionType)
        - `${str_get}` (aka "get") : get the value of the object in super_object[propname] (if get )
        - `${str_set}` (aka "set") : set the value of the object in super_object[propname] (else if set)
        if options.isObject is true :
            - `${str_get}Props` (aka "get_Props") : get the value of the object[...arrProps] in super_object[propname] (if get )
            - `${str_set}Props` (aka "set_Props") : set the value of the object[...arrProps] in super_object[propname] (else if set)

*/

export function setDefaultGetterOrSetter(obj, fieldName, options, str_getOrSet) {
    let [name_getMethod, name_setMethod] = ((_fieldName) => [nameGetMethod(_fieldName), nameSetMethod(_fieldName)])(!options?.notMethodNaming ? fieldName : undefined)

    /*
            options.trf_pipeline ? obj' =  options.trf_pipeline(obj) : obj
            _isStatic ? Function : (obj',...args) => value : Function : (...args) => fct(obj',...args)
    */
    //  obj[name_getMethod|name_setMethod] = Function

    switch (str_getOrSet) {
        case str_get :
        obj[name_getMethod] = staticEmbed(obj, options.isStatic, transformPipelineEmbed(options.trf_pipeline, (_obj) => {
            return s_getProp(_obj, fieldName, undefined)
        }))

        if (options?.isObject) {
            obj[`${name_getMethod}Props`] = staticEmbed(obj, options.isStatic, transformPipelineEmbed(options.trf_pipeline, (_obj, propnames) => {
                return getObjectFromPropsArray(_obj, [fieldName, ...propnames], undefined)
            }))
        }

        break
        case str_set :
        obj[name_setMethod] = staticEmbed(obj, options.isStatic, transformPipelineEmbed(options.trf_pipeline, (_obj, value) => {
            return setProp(_obj, fieldName, value)
        }))
        if (options?.isObject) {
            obj[`${name_setMethod}Props`] = staticEmbed(obj, options.isStatic, transformPipelineEmbed(options.trf_pipeline, (_this, propnames, value) => {
                return setExtraObjectFromPropsArray(_this[name_getMethod](), propnames, value, undefined)
            }))
        }
        break
        default :
        throw new Error(`str_getOrSet must be ${str_get} or ${str_set}`)
    }
}

// ------------------------------------------------------------ //

/* forEach of this fieldNames :
     forEach getOrSet of arr_str_getOrSet :
        create default${getOrSet}ter //(see "Default Methods" in setDefaultGetterOrSetter )
*/
export function setDefaultGetterOrAndSetters(obj, fieldNames, options, arr_str_getOrSet = [str_get, str_set]) {
    let fct = arr_str_getOrSet.includes(str_get) ? (_fieldName, _options) => { setDefaultGetterOrSetter(obj, _fieldName, _options, str_get) } : fct_nothing
    fct = ((_fct) => arr_str_getOrSet.includes(str_set) ? (_fieldName, _options) => { _fct(_fieldName, _options);setDefaultGetterOrSetter(obj, _fieldName, _options, str_set) } : _fct)(fct)

    for (const fieldName of fieldNames) {
        fct(fieldName, options)
    }
}

export const str_set = "set"
export const str_cst = "cst"

export const str_dfValue = "df_value"

// create in super_object an object in super_object[propname] with a bunch of method and a value ,
/*
    Default Methods :
        - `${str_get}` (aka "get") : get the value of the object in super_object[propname]
        - `${str_set}` (aka "set") : set the value of the object in super_object[propname]
        if options.isObject is true :
            - `${str_get}Props` (aka "get_Props") : get the value of the object[...arrProps] in super_object[propname]
            - `${str_set}Props` (aka "set_Props") : set the value of the object[...arrProps] in super_object[propname]

*/
/*
    Methods :
        - `${str_cst}` (aka "cst") :
        - nameSetMethod("Transform") (aka "set_Transform") : transform object[propname] with fct and affect it to object[propname]
        if options.isObject is true :
            - `${str_get}Keys` (aka "get_Keys"): get the keys of object[propname]
            - `${str_get}Values` (aka "get_Values"): get the values of object[propname]
        else if options.isArray is true :
            - `push` : push _object in object[propname]
            - `pop` : pop object[propname]
        if options.prop_notSet_value is defined :
            - `${str_get}NotSetValue` (aka "get_NotSetValue"): get the value of object[propname] when it's not set
            - `isNotSet` : return true if object[propname] is not set
            - `reset` : set object[propname] to object[`${str_get}NotSetValue`]()
*/

// - super_object[`get_${propname}`] : create in super_object a method super_object[nameGetMethod(propname)] (aka `get_${propname}` ) that return super_object[propname] (aka the object)

// assign to super_object["config_extendedFields"][propname] the options ( ps : create property "config_extendedFields" if not exist )

/*
PS:
    - _field_type : "object" | "array" | "value"
    - _df_value : default value of the object (by default : {} | [] | undefined)
*/
export const privateFieldNameChar = "_"

export function getPrivateFieldName(propname) {
    return `${privateFieldNameChar}${propname}`
}

const str_fieldType = "field_type"
export const prv_str_fieldType = getPrivateFieldName(str_fieldType)

export const prv_str_dfValue = getPrivateFieldName(str_dfValue)

export function extendedField(super_object, propname, options = undefined) {
    if (isUndefined(super_object[propname])) super_object[propname] = {}
    else if (!isObject(super_object[propname])) throw new Error(`super_object[${propname}] must be an object`)
    let object = super_object[propname]

    if (options !== undefined) {
        let fct_getFieldType = () => { return "value" }
        let fct_getDfValue = () => { return undefined }

        if (options.isObject) {
            fct_getFieldType = () => "object"
            fct_getDfValue = () => { return {} }
        } else if (options.isArray) {
            fct_getFieldType = () => "array"
            fct_getDfValue = () => { return [] }
        } else if (options.hasOwnProperty("prop_notSet_value")) {
            // cannot be prop_notSet_value and isObject or isArray
            fct_getFieldType = () => "value"
            fct_getDfValue = () => { return options.prop_notSet_value }
        }
     object[nameGetMethod(prv_str_fieldType)] = fct_getFieldType
     object[nameGetMethod(prv_str_dfValue)] = fct_getDfValue
    }

    object[str_cst] = function(value_prop = undefined) {
        if (isUndefined(value_prop)) value_prop = object[nameGetMethod(prv_str_dfValue)]()
        object[propname] = value_prop
    }

    setDefaultGetterOrAndSetters(object, [propname], {...options, notMethodNaming: true})

    object[nameSetMethod("Transform")] = function(prop, fct, ...args) {
        return setPropTransform(object, prop, (_this, _prop) => _this[`${str_get}Props`]([_prop]), (_this, _prop, _value) => _this[`${str_set}Props`]([_prop], _value), fct, ...args)
    }

    if (options !== undefined) {
        if (options.hasOwnProperty("isObject") && options.isObject === true) {
            object[`${str_get}Keys`] = function(providedValue = []) {
                let _obj = object[str_get]()
                return isNotEmptyObject(_obj) ? Object.keys(_obj) : providedValue
            }

            object[`${str_get}Values`] = function(providedValue = []) {
                let _obj = object[str_get]()
                return isNotEmptyObject(_obj) ? Object.values(_obj) : providedValue
            }
        }

        if (options.hasOwnProperty("isArray") && options.isArray === true) {
            object.push = function(_object) {
                let _arr = object[str_get]()
                return _arr.push(_object)
            }

            object.pop = function() {
                let _arr = object[str_get]()
                if (!isNotEmptyArray(_arr)) throw new Error(`cannot pop from object[${propname}] cause it's empty array `)
                return _arr.pop()
            }
        }

        if (options.hasOwnProperty("prop_notSet_value")) {
            object[`${str_get}NotSetValue`] = function() {
                return options.prop_notSet_value
            }

            object.isNotSet = function() {
                return object[str_get]() === object[`${str_get}NotSetValue`]()
            }

            object.reset = function() {
                return object[str_set](object[`${str_get}NotSetValue`]())
            }
        }

        getPropAndInitIfNotExist(super_object, "config_extendedFields", {})[propname] = options
    }

    super_object[nameGetMethod(propname)] = function() {
        return super_object?.[`${propname}`]
    }
}

// get obj[fieldName] value or getProps ("obj[fieldName] value" , propnames )
export function getExtendedFieldValue(obj, fieldName, ...propnames) {
    let _getExtendedField = getExtendedField(obj, fieldName)
    return !isNotEmptyArray(...propnames) ? _getExtendedField[str_get]() : _getExtendedField[`${str_get}Props`](propnames)
}
// set obj[fieldName] value  or setProps ("obj[fieldName] value" , propnames ,value)
export function setExtendedFieldValue(obj, fieldName, value, ...propnames) {
    let _getExtendedField = getExtendedField(obj, fieldName)
    return !isNotEmptyArray(...propnames) ? _getExtendedField[str_set](value) : _getExtendedField[`${str_set}Props`](propnames, value)
}

// ------------------------------------------------------------ //

// foreach prop in arr_obj_props , create and initialize an object in obj[prop] with extendedField
export function _initExtendedFields(obj, arr_obj_props, options) {
    const fct = options.isObject
? (_prop) => {
        extendedField(obj, _prop, options)
        getExtendedField(obj, _prop).cst()
    }
: (_prop) => {
        extendedField(obj, _prop, options)
        getExtendedField(obj, _prop).cst()
    }
    for (const prop of arr_obj_props) {
        fct(prop)
    }
}

// initExtendedFields :

        /*
            - obj[`arr_obj_props${joinCharField}${unique_abrev}`] = [...arr_obj_props]
            - obj[`unique_abrev${joinCharField}${unique_abrev}`] = unique_abrev

        */

    // & extendField :

        /*
            - `${str_get}` , `${str_set}` ,
            - `${str_cst}` , nameSetMethod("Transform") ,
            - options.isObject ? [`${str_get}Props` ,`${str_set}Props` ] | [`${str_get}Keys` , `${str_get}Values`]
            - options.isArray ? `push` , `pop`
            - options.prop_notSet_value ? `${str_get}NotSetValue` , `isNotSet` , `reset`
            - super_object[`get_${propname}`]
            - _field_type ,_df_value

        */
export function initExtendedFields(obj, arr_obj_props, unique_abrev, options) {
    setProp(obj, strArrToFieldName("arr_obj_props", unique_abrev), [...arr_obj_props])
    setProp(obj, strArrToFieldName("unique_abrev", unique_abrev), unique_abrev)

    _initExtendedFields(obj, arr_obj_props, options)
}
