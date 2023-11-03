import {initExtendedFields, getExtendedField, str_set, strArrToFunctionType} from "../primitives/Object.js"
import {depAndDeclFieldName, str_abreviation_declsAndDeps} from "./declAndDep.js"
import {DeclAndDepObject_addCreateDeclsAndDepsObjFromParser, DeclAndDepObject} from "./DeclAndDepObject.js"
import {addNodeFunctionality} from "../_node.js"

// init extendedField depAndDeclFieldName ( aka ["declarations","dependencies"] ) set abrev to str_abreviation_declsAndDeps
export function initDeclsAndDepsFields(obj) {
    const options = {isArray: true}
    initExtendedFields(obj, depAndDeclFieldName, str_abreviation_declsAndDeps, options)
}

/* initExtendedFields and for each props in arr_obj_props :
    if isObject then :
        -   addNodeFunctionality (wich are "addObjTo , `${str_set}FromSetObj` , `${str_get}KeyOf`" )
        and overwrite `${str_set}FromSetObj` allow to add object accordingly to Delclarations or Dependencies
*/

export function initNotDeclsAndDepsFields(obj, arr_obj_props, unique_abrev, options = {isObject: true}) {
    initExtendedFields(obj, arr_obj_props, unique_abrev, options)
    if (options.isObject) {
        DeclAndDepObject_addCreateDeclsAndDepsObjFromParser(obj, arr_obj_props, unique_abrev)
        for (const prop of arr_obj_props) {
            addNodeFunctionality(obj, prop)

            // OVERWRITE :
                let obj_prop = getExtendedField(obj, prop)
                // add _object field that isnt in Delclarations or Dependencies of _object
                obj_prop[`${str_set}FromSetObj`] = ((ancien_setFromSetObj) => function(_prop, _object, _propname) {
                    let keys_declAndDep = DeclAndDepObject.keysOf(obj[strArrToFunctionType("createDeclAndDepFromObj", unique_abrev)](_propname), _prop)
                    ancien_setFromSetObj(_prop, _object, keys_declAndDep)
                })(obj_prop[`${str_set}FromSetObj`])
        }
}
}
