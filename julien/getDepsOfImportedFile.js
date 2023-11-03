import {getDependenciesName, getDeclarationsName, depAndDeclFieldName} from "../acorn/src/julien/DeclAndDep/declAndDep.js"
import {getDepsFromFilePath, clean_ju_parse} from "../acorn/src/julien/main.js"
import {getPackageNameOfDeclaredVariables} from "../acorn/src/julien/extendsAcorn.js"
import {concatStringAndPropertyValue, ownPropertyNode, joinNodeNames, joinCharOfNodeNames} from "../acorn/src/julien/_nodeName.js"
import {_popFirstFieldOfObject, isNotEmptyObject, strArrToFieldName} from "../acorn/src/julien/primitives/Object.js"
import {juNodeDeclOrDep} from "../acorn/src/julien/_node.js"
import {isNotEmptyArray} from "../acorn/src/julien/primitives/Array.js"

import {getArrMatchFromRegexMatching, convertStrToRegExpStr} from "../acorn/src/julien/misc/_regexp.js"
import {getLabelFromTokenType} from "../acorn/src/tokentype.js"
import {types as tt} from "../acorn/src/mapTokentype.js"
import {str_props, str_posMap, str_filepath} from "../acorn/src/julien/token/configToken.js"
import {str_mainCallExpression} from "../acorn-walk/src/julien/ju_walk.js"
import {getSubsetFileStrFromPosMap} from "./SubsetFile.js"

export const str_dependencies = getDependenciesName(depAndDeclFieldName)
export const str_declarations = getDeclarationsName(depAndDeclFieldName)

export const str_import = getLabelFromTokenType(tt._import)
export const str_export = getLabelFromTokenType(tt._export)

export const str_props_import = strArrToFieldName(str_props, str_import)
export const str_props_export = strArrToFieldName(str_props, str_export)

const str_package_import = getPackageNameOfDeclaredVariables(str_import)
const str_package_export = getPackageNameOfDeclaredVariables(str_export)

export default async function getDepsOfImportedFile(to_import) {
  let res = {}
  let obj_deps = {}
  let path_code = ""
  let newfile = ""
  let fileContent = []
  let already_imported_files = {}
  let to_import_value_deps = {}
  let all_to_import = to_import
  let tmp = []

  while (isNotEmptyObject(all_to_import)) {
    let [to_import_key, to_import_value] = _popFirstFieldOfObject(all_to_import)
    to_import_value_deps = to_import_value[getDependenciesName(depAndDeclFieldName)]
    path_code = to_import_value[str_props_import][str_filepath]
    // assert (to_import_key == path_code)

    if (already_imported_files[path_code]) {
      let keys_deps_path_code = Object.keys(already_imported_files[path_code])
      to_import_value_deps = Object.entries(to_import_value_deps).reduce((_obj_, elm) => {
        if (!keys_deps_path_code.includes(elm))_obj_[elm[0]] = elm[1]
        return _obj_
}, {})
    } else already_imported_files[to_import_value[str_props_import][str_filepath]] = {}

    already_imported_files[path_code] = {...already_imported_files[path_code], ...to_import_value_deps}

    // TODO :
    obj_deps = Object.entries(to_import_value_deps).reduce((_obj, _elm) => {
      tmp = getArrMatchFromRegexMatching(_elm[0], new RegExp(`${convertStrToRegExpStr(concatStringAndPropertyValue(getLabelFromTokenType(tt._import), path_code) + joinCharOfNodeNames)}(.+)`), [1]) // A FAIRE : with getNodeNameAndSubPackageName // import["${path_code}"].(.+)
      return isNotEmptyArray(tmp) ? {..._obj, ...juNodeDeclOrDep.factory({..._elm[1], ju_name: joinNodeNames(str_package_export, tmp[0])})} : {..._obj, ...juNodeDeclOrDep.factory(_elm[1])} // TODO : joinNodeNames -> joinNodeNameAndProperties or erase joinNodeNameAndProperties everywhere
    }, {})

    clean_ju_parse(path_code)

    res = await getDepsFromFilePath(obj_deps, path_code, {sourceType: "module"}, 0, true, 7)
    to_import = res[str_package_import]

    all_to_import = Object.entries(to_import).reduce((_obj, _elm) => {
      let _filepath = _elm[1][str_props_import][str_filepath]
      if (!ownPropertyNode(_obj, _filepath)) _obj[_filepath] = {..._elm[1]}
      else _obj[_filepath] = {..._obj[_filepath], ..._elm[1]}
      return _obj
    }, all_to_import)

    newfile = getSubsetFileStrFromPosMap(res[str_posMap], path_code)
    newfile = newfile + "\n//INIT:\n" + getSubsetFileStrFromPosMap(res[str_mainCallExpression], path_code)
    fileContent.push(newfile)
  }
  return fileContent
}
