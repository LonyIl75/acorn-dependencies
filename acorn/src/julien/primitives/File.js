import path from "path"
import fs from "fs"

import {isPrefix, jsonObjectToString, camelize, majFirstChar, joinArray_with_char} from "./String.js"

export const isSubFilePath = isPrefix

// FILE

export function defaultEmbeddingJsonStrFile(jsonStr) {
    return "export default " + jsonStr // +`\n //# sourceMappingURL=${filename}.js.map`
}

export function writeSyncJsonObjectToExportDfFile(filepath, jsonObject, callback = (err) => { if (err) throw err; console.log("The file has been saved!") }) {
    return fs.writeFileSync(filepath, defaultEmbeddingJsonStrFile(jsonObjectToString(jsonObject)), callback)
}

export async function dynamicImportFile(filepath) {
    return import("file://" + filepath)
}

export async function readASyncExportDfFileToJsonObject(filepath) {
    return await dynamicImportFile(filepath).then((module) => module.default)
}

export const getFileExtNameFromFilePath = (_filepath) => {
    return path.extname(_filepath)
}

export const getFileBaseNameFromFilePath = (_filepath) => {
    return path.basename(_filepath, getFileExtNameFromFilePath(_filepath))
}

export const getFileDirPathFromFilePath = (_filepath) => {
    return path.dirname(_filepath)
}

export const joinPath = (...args) => {
    return path.join(...args) // joinArray_with_char([...args],path.sep)//path.join(...args)
}
export const resolveRelative = (dirPath, relativePath) => {
 return path.resolve(dirPath, relativePath)
}

export async function getContentFileIfExistElseComputeAndSave(filepath, computeAndSaveFct, ...args) {
    if (!fs.existsSync(filepath)) await computeAndSaveFct(...args)
    return readASyncExportDfFileToJsonObject(filepath)
}

export function getSaveFilename(field_name, filename) {
    let nw_field_name = camelize(field_name)
    let prefix = `save${majFirstChar(nw_field_name)}`
    let joinChar = "_"
    let ext = ".js"
    return joinArray_with_char([prefix, filename], joinChar) + ext
}
