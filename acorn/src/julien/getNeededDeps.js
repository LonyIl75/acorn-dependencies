import {concatRegExp, regexOrStrToNonCapturingGroup, unionStrRegex, regexOrStrToBeginOfLine, getMatchAndPosFromRegexMatchingFullMatch, MatchObject, RegStr, regexOrStrToCapturingGroup, deleteMatchedStr, getArrMatchFromRegexMatching} from "./misc/_regexp.js"
import {isPropsKey, isMatchExtendedMember, joinCharOfNodeNames_regex, joinCharOfNodeNames, getNodeNameAndSubPackageName, ownPropertyNode, getRootAndRestFieldsFromMemberExpression, getRootAndRestFieldsFromStaticMemberExpression, joinNodeNames, isMatchObjectName, unionNodeNames, charUnionNodeNames, getNodeAlternativeKeyArr, getMemberFieldRegex} from "./_nodeName.js"
import {_popFirstFieldOfObject, cstObjectFromEntry, setProp, s_getProp, objectElement_chooseAlternativeKeyWithFct, isNotEmptyObject, objectElements_keyVerifyFct, mergeDeep, strArrToFieldName, getObjectFromPropsArray} from "./primitives/Object.js"
import {str_program, str_props, str_posMap} from "./token/configToken.js"
import {fct_nothing} from "./primitives/Function.js"
import {getDeclAndDep, getDependenciesName, getDeclarationsName, depAndDeclFieldName, declAndDep_str} from "./DeclAndDep/declAndDep.js"
import {isContext, ithContextRegExp} from "./_context.js"
import {getLabelFromTokenType} from "../tokentype.js"
import {types as tt} from "../mapTokentype.js"
import {getPackageNameOfDeclaredVariables, getPropsPropertyOfNode, getPosMap} from "./extendsAcorn.js"
import {isNotEmptyArray} from "./primitives/Array.js"
import {juNodeDeclOrDep} from "./_node.js"

const str_package_import = getPackageNameOfDeclaredVariables(getLabelFromTokenType(tt._import))
const str_package_export = getPackageNameOfDeclaredVariables(getLabelFromTokenType(tt._export))

const regExp_package_importOrExport = new RegStr(unionStrRegex([getLabelFromTokenType(tt._import), getLabelFromTokenType(tt._export)])).regExp

let getDepsObj_help_function

(function(getDepsObj_help_function) {
    getDepsObj_help_function.getOtherDeps = function(obj_deps, deps, decl, _arr_keys_decl) {
        return Object.entries(obj_deps).reduce((_obj, child_element) => {
        if (!isMatchExtendedMember(child_element[0], joinCharOfNodeNames_regex, _arr_keys_decl))Object.entries(child_element[1]).forEach((elm) => {
            if (!ownPropertyNode(deps, elm[0]) && !ownPropertyNode(decl, elm[0]))_obj[elm[0]] = _obj.hasOwnProperty(elm[0]) ? {..._obj[elm[0]], ...elm[1]} : elm[1]
        })
        return _obj
        }, {})
    }

    getDepsObj_help_function.getFirstEntryPropsNotNullElseProvidedValue = function(obj, props, providedValue = undefined) {
        for (const prop of props) {
        if (obj[prop]) return [prop, obj[prop]]
        }
        return providedValue
    }

    getDepsObj_help_function.matchSubPackage = (_str, base_package_name, invalidValue = null) => {
        // matchPackageNameOrSubPackage
        let match = getArrMatchFromRegexMatching(_str, concatRegExp(new RegExp(regexOrStrToBeginOfLine(regexOrStrToCapturingGroup(base_package_name))), ithContextRegExp))
        if (isNotEmptyArray(match)) return match[0]

        return invalidValue
    }

    getDepsObj_help_function.matchPackage = (_str, base_package_name, invalidValue = null) => {
        let package_name = getPackageNameOfDeclaredVariables(base_package_name)
        let match = getMatchAndPosFromRegexMatchingFullMatch(_str, new RegExp(regexOrStrToBeginOfLine(regexOrStrToCapturingGroup(package_name))))
        if (match) return match
        return invalidValue
    }

    getDepsObj_help_function.toImport_initIfNotExist = function(base_declAndDep_obj, to_import, element_name) {
        // TODO : REFACTOR hasOwnProperty -> ownProperty
        if (!to_import.hasOwnProperty(element_name)) {
            to_import[element_name] = {[getDependenciesName(depAndDeclFieldName)]: {}, ...getPropsPropertyOfNode(base_declAndDep_obj[element_name])} // strArrToFieldName(str_props,element_name)
        }
        }

    getDepsObj_help_function.updateToImport = function(base_obj, acc_obj, subpackage_name, element_name) {
        let base_declAndDep_obj = getDeclAndDep(base_obj)
        let to_import = acc_obj[str_package_import]
        let [new_dep_key, new_dep_value] = _popFirstFieldOfObject(getObjectFromPropsArray(base_declAndDep_obj, [subpackage_name, element_name, getDependenciesName(depAndDeclFieldName), element_name], {}))
        if (new_dep_key) {
            getDepsObj_help_function.toImport_initIfNotExist(base_declAndDep_obj, to_import, subpackage_name)
        // TODO : REFACTOR mergeField + set
        to_import[subpackage_name][getDependenciesName(depAndDeclFieldName)] = {...to_import[subpackage_name][getDependenciesName(depAndDeclFieldName)], ...cstObjectFromEntry([new_dep_key, new_dep_value])}//, ...base_declAndDep_obj[subpackage_name][getDependenciesName(depAndDeclFieldName)][element_name]}
        }
    }

    getDepsObj_help_function.updateToDeclare = function(base_obj, acc_obj, name_elementToDeclare) {
        let base_declAndDep_obj = getDeclAndDep(base_obj)
        let base_posMap_obj = getPosMap(base_obj)

        acc_obj[str_posMap][name_elementToDeclare] = base_posMap_obj[name_elementToDeclare] // A FAIRE : call setProps ect
        acc_obj[getDeclarationsName(depAndDeclFieldName)][name_elementToDeclare] = base_declAndDep_obj[name_elementToDeclare]
        Object.assign(acc_obj[getDependenciesName(depAndDeclFieldName)], {...acc_obj[getDependenciesName(depAndDeclFieldName)], ...getObjectFromPropsArray(base_declAndDep_obj, [name_elementToDeclare, getDependenciesName(depAndDeclFieldName), name_elementToDeclare])})
        }

    getDepsObj_help_function.updateToExport = function(base_obj, acc_obj, subpackage_name, element_name) {
        return getDepsObj_help_function.updateToDeclare(base_obj, acc_obj, element_name)
    }

    getDepsObj_help_function.updateWithPackageObject = function(base_obj, acc_obj, base_package_name, subpackage_name, elementOfPackageKey) {
    // posMap[importWithNum] = base_posMap_obj[importWithNum]
    let fct = fct_nothing
    switch (base_package_name) {
        case getLabelFromTokenType(tt._import):
        fct = getDepsObj_help_function.updateToImport
        break
        case getLabelFromTokenType(tt._export):
        fct = getDepsObj_help_function.updateToExport
        break
    }
    return fct(base_obj, acc_obj, subpackage_name, elementOfPackageKey)
    }
    getDepsObj_help_function.cstDeclAndDepObj = function(declAndDep, obj = {}) {
    return {...obj, [declAndDep_str]: declAndDep}
    }
    getDepsObj_help_function.cstToImportObj = function(to_import, obj = {}) {
    return {...obj, [str_package_import]: to_import}
    }

    getDepsObj_help_function.cstPosMapObj = function(posMap, obj = {}) {
    return {...obj, [str_posMap]: posMap}
    }

    getDepsObj_help_function.cstDeclObj = function(decl, obj = {}) {
    return {...obj, [getDeclarationsName(depAndDeclFieldName)]: decl}
    }

    getDepsObj_help_function.cstDepObj = function(dep, obj = {}) {
    return {...obj, [getDependenciesName(depAndDeclFieldName)]: dep}
    }

    getDepsObj_help_function.subPackageNameToPackage_s_Name = (_str) => {
    // subPackageName == pattern`(import|export)\[\d+\]`
    let [subPackageName, _] = getNodeNameAndSubPackageName(_str, regExp_package_importOrExport)
    // -> (import|export) + "s"
    return subPackageName ? getPackageNameOfDeclaredVariables(deleteMatchedStr(subPackageName, ithContextRegExp)) : _str
    }
})(getDepsObj_help_function = getDepsObj_help_function || (getDepsObj_help_function = {}))

Object.freeze(getDepsObj_help_function)

let getDepsObj

const name_getDepsFunction = "getNeededDeps";

(function(getDepsObj) {
    const help = getDepsObj_help_function
    getDepsObj[name_getDepsFunction] = function(deps, base_declAndDep, base_posMap, base_name = str_program, posMap = {}) {
        let name_toFind = ""
        let find_element = null
        let notResolved = {}
        let [propName, value] = help.getFirstEntryPropsNotNullElseProvidedValue(base_declAndDep, getNodeAlternativeKeyArr(base_name))
        let base_declAndDep_obj = value
        let base_posMap_obj = base_posMap[propName]
        if (!base_declAndDep_obj || !base_posMap_obj) return help.cstDepObj({...deps}, help.cstDeclObj({}, help.cstPosMapObj({}, help.cstToImportObj({}))))

        function defaultCase(deps_obj, notResolved_obj, key_element, _element) {
            Object.entries(_element).forEach((_elm) => {
                let val = _elm[1]
                if (deps_obj?.hasOwnProperty(_elm[0])) {
                val = {...deps_obj[_elm[0]], ...val}
                delete deps_obj[_elm[0]]
                }
                notResolved_obj[_elm[0]] = val
            })
        }

        let decl = {}

        let value_toFind = {}
        let tmp
        let tmp_decl = {}
        let tmp_deps = {}
        let to_import = {}

        do {
            [name_toFind, value_toFind] = _popFirstFieldOfObject(deps)

            let arr_name_tmp = getNodeAlternativeKeyArr(name_toFind)
            arr_name_tmp = arr_name_tmp.reduce((_arr_, key_str) => {
            return [..._arr_, (() => {
                if (ownPropertyNode(base_declAndDep_obj[str_package_import], key_str)) {
                return _popFirstFieldOfObject(base_declAndDep_obj[str_package_import][key_str][getDependenciesName(depAndDeclFieldName)][key_str])[1].ju_name
            }
            let _t = null
            if ((_t = help.matchPackage(key_str, getLabelFromTokenType(tt._export), null))) {
                let nw_key_str = key_str.substring(_t.end + joinCharOfNodeNames.length)
                return _popFirstFieldOfObject(base_declAndDep_obj[str_package_export][nw_key_str][getDependenciesName(depAndDeclFieldName)][nw_key_str])[1].ju_name
            } else return key_str
            })()]
            }, [])
            let _bb = false
            for (let k = 0 ; !_bb && k < arr_name_tmp.length ; k++) {
                let _name_toFind = arr_name_tmp[k]

                tmp = getRootAndRestFieldsFromMemberExpression(_name_toFind) || getRootAndRestFieldsFromStaticMemberExpression(_name_toFind)

                if (tmp && tmp[1]) {
                let root = tmp[0]
                let rest = tmp[1]
                if (ownPropertyNode(base_declAndDep_obj, root)) {
                    let match = null

                    if ((match = help.matchSubPackage(root, getLabelFromTokenType(tt._import), null))) {
                        if (ownPropertyNode(base_declAndDep_obj[root], rest)) {
                            help.updateWithPackageObject(help.cstDeclAndDepObj(base_declAndDep_obj), help.cstToImportObj(to_import), getLabelFromTokenType(tt._import), root, rest)
                            decl = {...decl, ...cstObjectFromEntry([rest, value_toFind])}
                            _bb = true
                            break
                        }
                    } else if (match = help.matchSubPackage(root, getLabelFromTokenType(tt._export), null)) {
                        if (ownPropertyNode(base_declAndDep_obj[root], rest)) {
                            let [exportWithNumAndName, exportValue] = _popFirstFieldOfObject(base_declAndDep_obj[root][rest].dependencies[rest])
                            if (exportWithNumAndName)help.updateWithPackageObject(help.cstPosMapObj(base_posMap_obj, help.cstDeclAndDepObj(base_declAndDep_obj)), help.cstDepObj(deps, help.cstDeclObj(decl, help.cstPosMapObj(posMap))), getLabelFromTokenType(tt._export), root, exportWithNumAndName)
                            _bb = true
                            break
                        }
                    } else {
                        // posMap[root] = base_posMap_obj[root]
                        let keyofDecl = Object.keys(decl)
                        if (!keyofDecl.includes(root))deps = {...deps, [root]: base_declAndDep_obj[root][str_props]}

                        // result :
                        tmp = getDepsObj[name_getDepsFunction](juNodeDeclOrDep.factoryFromProps({...value_toFind, ju_name: unionStrRegex([joinNodeNames(root, rest), rest])}), base_declAndDep_obj, base_posMap_obj,
                        unionStrRegex([unionNodeNames(root, rest), root]))

                        let restMemberStillUnresolved = objectElements_keyVerifyFct(tmp[getDependenciesName(depAndDeclFieldName)], (_str) => {
                            if (concatRegExp(regexOrStrToBeginOfLine(regexOrStrToNonCapturingGroup(regExp_package_importOrExport, false), false), /(.+)/).test(_str)) {
                            let _t = getMatchAndPosFromRegexMatchingFullMatch(_str, getMemberFieldRegex(joinCharOfNodeNames))
                            if (!MatchObject.isNotFoundMatch(_t)) _str = _str.substring(_t.end + joinCharOfNodeNames.length)
                            }
                        return isMatchExtendedMember(_str, joinCharOfNodeNames, [rest])
                        }, charUnionNodeNames)
                        if (isNotEmptyObject(restMemberStillUnresolved))setProp(notResolved, _name_toFind, cstObjectFromEntry([_name_toFind, value_toFind]))

                        // filter deps
                        tmp_deps = Object.entries(tmp[getDependenciesName(depAndDeclFieldName)]).reduce((_obj, elm) => {
                        if (!keyofDecl.includes(elm[0]) && !restMemberStillUnresolved[elm[0]])_obj[elm[0]] = elm[1]
                        return _obj
                        }, {})

                        // filter decl
                        tmp_decl = Object.entries(tmp[getDeclarationsName(depAndDeclFieldName)]).reduce((_obj, elm) => { return {..._obj, [joinNodeNames(root, elm[0])]: elm[1]} }, {})

                        // merge
                        deps = {...deps, ...tmp_deps}
                        decl = {...decl, ...tmp_decl}
                        mergeDeep(to_import, tmp[str_package_import], 1, (_str) => isPropsKey(_str) || _str === getDependenciesName(depAndDeclFieldName))
                        posMap = {...getPosMap(tmp), ...posMap}
                    }
                    }
                }
                if ((ownPropertyNode(base_declAndDep_obj, _name_toFind) && !ownPropertyNode(base_declAndDep_obj[str_package_import], _name_toFind))/* || isContext(_name_toFind) */ || ((tmp = getRootAndRestFieldsFromMemberExpression(_name_toFind)) && tmp[1] && base_declAndDep_obj[_name_toFind])) {
                find_element = base_declAndDep_obj[_name_toFind]
                tmp_deps = find_element[getDependenciesName(depAndDeclFieldName)]

                posMap[_name_toFind] = base_posMap_obj[_name_toFind]
                decl[_name_toFind] = s_getProp(find_element, str_props)

                let arr_keys_decl = Object.keys(base_declAndDep_obj).filter((_stre) => _stre !== _name_toFind) // ? =Object.keys( base_declAndDep_obj_decl)

                tmp_deps = help.getOtherDeps(tmp_deps, deps, decl, arr_keys_decl)

                // remove unecessary name from pipedname (key rename)
                tmp_deps = objectElement_chooseAlternativeKeyWithFct(tmp_deps,
                    (arr) => {
                    let res = arr.length > 1 ? arr?.filter((elm_name) => isMatchObjectName(elm_name)) : arr
                    return res.map(help.subPackageNameToPackage_s_Name)
                    },
                    charUnionNodeNames,
                    (entry) => { return {...entry[1], ju_name: entry[0]} }// TODO : changeJuName function + setInternalJuName
                )

                if (deps.hasOwnProperty(_name_toFind)) delete deps[_name_toFind]
                deps = {...deps, ...tmp_deps}
                _bb = true
                break
                }
            }

            if (!_bb) {
                defaultCase(deps, notResolved, name_toFind, juNodeDeclOrDep.factoryFromProps(value_toFind))
            }
        } while (isNotEmptyObject(deps))

        return help.cstDepObj(notResolved, help.cstDeclObj(decl, help.cstPosMapObj(posMap, help.cstToImportObj(to_import))))
    }
})(getDepsObj = getDepsObj || (getDepsObj = {}))

export const getNeededDeps = getDepsObj[name_getDepsFunction]
