import {s_getProp, setProp} from "../primitives/Object.js"
import {isNotEmptyArray} from "../primitives/Array.js"
import {getSaveFilename, getFileBaseNameFromFilePath, getFileDirPathFromFilePath, joinPath, writeSyncJsonObjectToExportDfFile} from "../primitives/File.js"
import {majFirstChar} from "../primitives/String.js"

export function getDependenciesName(arr) {
    return arr[1]
}
export function getDeclarationsName(arr) {
    return arr[0]
}

export const str_dependencies = "dependencies"
export const str_declarations = "declarations"
export const str_abreviation_declsAndDeps = "DeclsAndDeps"

export const depAndDeclFieldName = [str_declarations, str_dependencies]

export function savedIsEnabled(obj) {
    return getSaveDeclAndDepFilename(obj) ? true : false // eslint-disable-line no-unneeded-ternary
}

// A FAIRE REFACTOR : with extendedField

  export function getDeclAndDep(obj) {
    return s_getProp(obj, declAndDep_str)
  }

  export function setDeclAndDep(obj, value) {
    return setProp(obj, declAndDep_str, value)
  }

  export function getDeclAndDepValue(obj) {
    if (!isNotEmptyArray(Object.keys(getDeclAndDep(obj)))) return getDeclAndDep(obj)
    return {[getDeclarationsName(depAndDeclFieldName)]: getDeclAndDep(obj).declarations, [getDependenciesName(depAndDeclFieldName)]: getDeclAndDep(obj).dependencies}
  }

  function getSaveDeclAndDepFilename(obj) {
    return obj.saveDeclAndDepFilename
  }

export function getNameOfSaveDeclAndDepFileFromFilename(filename) {
    return getSaveFilename(declAndDep_str, filename)
}

export function juParser_getNameOfSaveDeclAndDepFileFromFilename(filepath) {
  return joinPath(getFileDirPathFromFilePath(filepath), getNameOfSaveDeclAndDepFileFromFilename(getFileBaseNameFromFilePath(filepath)))
}

export function writeSavedDeclAndDep(obj) {
  return writeSyncJsonObjectToExportDfFile(getSaveDeclAndDepFilename(obj), getDeclAndDep(obj))
}

export const declAndDep_str = "DeclAndDep"

export const str_curr = "curr"
export const currDepAndDeclFieldName = depAndDeclFieldName.map((name) => `${str_curr}${majFirstChar(name)}`)
export const str_abreviation_currDeclAndDep = `${str_curr}${str_abreviation_declsAndDeps}`

export const df_scopeDepth = -1

export const parser_currDeclsAndDeps_options = {isObject: true}

// export const arr_declsAndDepsOfNode = depAndDeclFieldName.map((elm)=>`ju_${elm}`)
// export const abrev_declsAndDepsOfNode = `ju${str_abreviation_declsAndDeps}`
