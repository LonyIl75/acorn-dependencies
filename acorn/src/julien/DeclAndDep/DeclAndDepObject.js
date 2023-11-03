import {getDependenciesName, str_declarations, str_dependencies, getDeclarationsName} from "./declAndDep.js"
import {getExtendedFieldValue, setObjectFromPropsArray, nameGetMethod, strArrToFieldName, str_dfValue, setDefaultGetterOrAndSetters, s_getProp} from "../primitives/Object.js"

export const DeclAndDepObject_str_declarations = str_declarations
export const DeclAndDepObject_str_dependencies = str_dependencies
export const DeclAndDepObject_str_arr = [DeclAndDepObject_str_declarations, DeclAndDepObject_str_dependencies]

export let DeclAndDepObject = {};
(function(DeclAndDepObject) {
    DeclAndDepObject[`${strArrToFieldName(str_dfValue, DeclAndDepObject_str_declarations)}`] = {}
    DeclAndDepObject[`${strArrToFieldName(str_dfValue, DeclAndDepObject_str_dependencies)}`] = {}

    DeclAndDepObject.createDeclsDepsObj = function(decl, dep, ifNot = {}, ifNot_2 = {}) {
    return {[DeclAndDepObject_str_declarations]: decl || ifNot, [DeclAndDepObject_str_dependencies]: dep || ifNot_2}
    }

    setDefaultGetterOrAndSetters(DeclAndDepObject, DeclAndDepObject_str_arr, {isObject: true, isStatic: true})

    DeclAndDepObject.keysOf = function(obj, prop) {
        let declarations = DeclAndDepObject[nameGetMethod(DeclAndDepObject_str_declarations)](obj)
        let dependencies = DeclAndDepObject[nameGetMethod(DeclAndDepObject_str_dependencies)](obj)
        let declAndDepsKeys = Object.keys({...prop ? s_getProp(dependencies, prop, {}) : dependencies, ...prop ? s_getProp(declarations, prop, {}) : declarations})
        return declAndDepsKeys
    }

    DeclAndDepObject.mergeDeclAndDep = function(declAndDep_1, declAndDep_2, name_2) {
        setObjectFromPropsArray(declAndDep_1, [DeclAndDepObject_str_declarations, name_2], declAndDep_2[DeclAndDepObject_str_declarations])
        setObjectFromPropsArray(declAndDep_1, [DeclAndDepObject_str_dependencies, name_2], declAndDep_2[DeclAndDepObject_str_dependencies])
    }
})(DeclAndDepObject)

export function DeclAndDepObject_addCreateDeclsAndDepsObjFromParser(obj, arr_obj_props, unique_abrev) {
    obj[strArrToFieldName("createDeclAndDepFromObj", unique_abrev)] = function(_propname) {
        let currDecl = _propname === undefined ? getExtendedFieldValue(obj, getDeclarationsName(arr_obj_props)) : getExtendedFieldValue(obj, getDeclarationsName(arr_obj_props), _propname)
        let currDep = _propname === undefined ? getExtendedFieldValue(obj, getDependenciesName(arr_obj_props)) : getExtendedFieldValue(obj, getDependenciesName(arr_obj_props), _propname)
        return DeclAndDepObject.createDeclsDepsObj(currDecl, currDep, {}, {})
    }
}
