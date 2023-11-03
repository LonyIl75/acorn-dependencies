import {retJuNameIfExistElseValueProvided, getJuNameOrName} from "./_nodeName.js"
import {s_getProp, mergeObjectWithField, str_cst, extendedField, strArrToFieldName, getExtendedField, getExtendedFieldValue, setDefaultGetterOrAndSetters, str_get, str_set} from "./primitives/Object.js"
import {setDeclAndDep} from "./DeclAndDep/declAndDep.js"
import {DeclAndDepObject} from "./DeclAndDep/DeclAndDepObject.js"
import {isFunction} from "./primitives/Function.js"
import {isNotEmptyArray} from "./primitives/Array.js"
import {str_posMap} from "./token/configToken.js"

export const str_unknown = "unknown"

const df_juType = str_unknown
const df_juAnnotation = str_unknown
export const df_juName = str_unknown

export const juPrefix = "ju"
export function getAddJuPrefix(str) {
    return strArrToFieldName(juPrefix, str)
}

const str_annotation = "annotation"
const str_type = "type"

const str_juName = getAddJuPrefix("name")
export const str_juAnnotation = getAddJuPrefix(str_annotation)
export const str_juType = getAddJuPrefix(str_type)
const str_juPosMap = getAddJuPrefix(str_posMap)

// INIT :
/*
    ju_type : type of the node
    ju_annotation : annotation of the node
    ju_posMap : map of the statement position associate with this node

*/
export function initExtendedFieldJuNode(obj, ju_type, ju_annotation, ju_posMap) {
    obj.ju_name = ""

    extendedField(obj, str_juType, {isObject: false, prop_notSet_value: df_juType})
    obj[str_juType].cst(ju_type)

    extendedField(obj, str_juAnnotation, {isObject: false, prop_notSet_value: df_juAnnotation})
    obj[str_juAnnotation].cst(ju_annotation)

    extendedField(obj, str_juPosMap, {isObject: true})
    addNodeFunctionality(obj, str_juPosMap)
    obj[str_juPosMap].cst(ju_posMap)

    setDeclAndDep(obj, DeclAndDepObject.createDeclsDepsObj())
  }

let JuNode = {};
(function(object) {
    object[str_cst] = function(name, annotation, type, posMap) {
        this.name = name
        initExtendedFieldJuNode(this, type, annotation, posMap)
    }

    /* setDefaultGetterOrAndSetters(object,[str_juName,str_juAnnotation,str_juType])
    setDefaultGetterOrAndSetters(object,[str_juPosMap],{isObject : true}) */
})(JuNode)

let node_propsIdentifier = ["", "key", "id"]

// NODE GETTER :

    export function getFirstNotNullPropNameOfNode(node, arr_props_identifier = node_propsIdentifier) {
        let res = retJuNameIfExistElseValueProvided(node)
        arr_props_identifier.push(arr_props_identifier[0])
        for (let i = 1 ; i <= arr_props_identifier.length ; i++) {
            if (res) return res
            res = retJuNameIfExistElseValueProvided(node[arr_props_identifier[i]])
        }
        return res
    }

// NODE :

// A FAIRE :  REFACTOR because use case is strange (translate to prefix :"ju" -> at nothing )
// return value {name : ju_name, annotation : ju_annotation, type : ju_type , pos :  [obj.start , obj.end] } of  obj
export function juNodeDeclOrDep_extractJuProps(obj) {
    let {ju_name, ju_annotation, ju_type} = obj // ju_pos
    // let {name,annotation,type} = {ju_name.get() , ju_annotation.get() , ju_type.get()}
    let name = ju_name
    let annotation = ju_annotation.isNotSet() ? undefined : ju_annotation.get()
    let type = ju_type.isNotSet() ? undefined : ju_type.get()
    let pos = [obj.start, obj.end]
    return {name, annotation, type, pos}// pos
}

export let juNodeDeclOrDep = {};
(function(juNodeDeclOrDep) {
    juNodeDeclOrDep.factory = function(node) {
        let obj = {}
        obj.ju_name = getJuNameOrName(node)
        if (node[str_juAnnotation] && !node[str_juAnnotation].isNotSet())obj.annotation = node[str_juAnnotation].get()
        if (node[str_juType] && !node[str_juType].isNotSet())obj.type = node[str_juType].get()
        obj.start = node.start
        obj.end = node.end
        obj.acorn_type = node.type
        return {[obj.ju_name]: obj}
    }

    juNodeDeclOrDep._getValue = function(obj) {
        return Object.values(obj)[0]
    }
    // default get and set (aka get , set ) for [str_juName,str_annotation,str_type]  and just before call _getValue on the object , for ex  Object.values(obj)[0][str_juName] (for ju_name get )
    setDefaultGetterOrAndSetters(juNodeDeclOrDep, [str_juName, str_annotation, str_type], {trf_pipeline: juNodeDeclOrDep._getValue})

    juNodeDeclOrDep.getJuPos = function(obj) {
        return [obj.start, obj.end]
    }

    juNodeDeclOrDep.factoryFromProps = function(props) {
        // A FAIRE : verify props (props aka json obj != node )
        return juNodeDeclOrDep.factory(props)
    }
})(juNodeDeclOrDep)

export function renameJuNodes(obj, fct_renameKey, fct_renameJuName = undefined) {
    if (!isFunction(fct_renameJuName)) fct_renameJuName = fct_renameKey
    return Object.entries(obj).reduce((_acc, elm) => {
      let [new_key_name, new_ju_name] = [fct_renameKey(elm[0]), fct_renameJuName(elm[1].ju_name)]
      return {[new_key_name]: {...elm[1], ju_name: new_ju_name}}
    }, {})
  }
/*
Methods :
  - addObjTo
  - `${str_set}FromSetObj` (aka setFromSetObj)
  - `${str_get}KeyOf` (aka getKeyOf)

*/
export function addNodeFunctionality(obj, prop) {
        let obj_prop = getExtendedField(obj, prop)

        // add subsetIds props of object to obj[prop][_prop]
        obj_prop.addObjTo = function(_props, _object, subsetIds = undefined, otherProp = undefined) {
            let set = mergeObjectWithField(getExtendedFieldValue(obj, prop), _props, _object, subsetIds, otherProp)
            return getExtendedField(obj, prop)[`${str_set}Props`](_props, set)
        }
        // add all non existing _object field in keys_declAndDep[_prop] to obj[prop]
        obj_prop[`${str_set}FromSetObj`] = function(_props, _object, keys_declAndDep) {
            let subsetIds = Object.keys(_object).filter((key) => !keys_declAndDep.includes(key))
            if (isNotEmptyArray(subsetIds))getExtendedField(obj, prop).addObjTo(_props, _object, subsetIds)
        }
        // get keys of "obj[prop] value"[_prop]
        obj_prop[`${str_get}KeyOf`] = function(_prop) {
            let elm = s_getProp(getExtendedField(obj, prop), _prop, [])
            return Object.keys(elm)
        }
    }
