import classElement from "../extension/ClassElement.js"
import staticClassElement from "../extension/staticClassElement.js"
import * as acorn from "../index.js"
import {ju_walk, juWalk_getNameOfSavePosMapFileFromFilename, str_mainCallExpression} from "../../../acorn-walk/src/julien/ju_walk.js"
import {ju_walk_iterate} from "../../../acorn-walk/src/julien/implementation.js"
import {getFileDirPathFromFilePath, getFileBaseNameFromFilePath, joinPath, readASyncExportDfFileToJsonObject} from "./primitives/File.js"
import {createJuArgsForParse} from "./_todo.js"
import {getNameOfSaveDeclAndDepFileFromFilename} from "./DeclAndDep/declAndDep.js"
import {getAddJuPrefix} from "./_node.js"
import path from "path"
import fs from "fs"
import {getNeededDeps} from "./getNeededDeps.js"
import {getPosMap} from "./extendsAcorn.js"

// acorn :
const str_parse = "parse"

// acorn-walk :
const str_walk = "walk"

const str_ju_parse = getAddJuPrefix(str_parse)
const str_ju_walk = getAddJuPrefix(str_walk)

export const ju_parse = (parser_args) => {
    let {input, options, startPos} = parser_args.acorn_args
    let res = acorn.Parser.extend(staticClassElement, classElement).parse(input, options, startPos, parser_args.ju_args)

    let [_, mainCallExpressionPosMap] = ju_walk_iterate(ju_walk, res)

    ju_walk.juWalk_writeSavedDeclAndDep(parser_args.ju_args.filepath, mainCallExpressionPosMap)

    return res
}

export function clean_ju_parse(path_code) {
    let dirPath = getFileDirPathFromFilePath(path_code)
    let filename = getFileBaseNameFromFilePath(path_code)

    let filepath_declAndDep = joinPath(path.resolve(dirPath), getNameOfSaveDeclAndDepFileFromFilename(filename))
    let filepath_posMap = joinPath(path.resolve(dirPath), juWalk_getNameOfSavePosMapFileFromFilename(filename))

    const fct_clean_file = (filepath) => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    }
    [filepath_declAndDep, filepath_posMap].forEach((filepath) => fct_clean_file(filepath))
}

export async function readResultFileJuParse(filepath, options = {sourceType: "module"}, startPos = 0, ...param_juArgs) {
    let dirPath = getFileDirPathFromFilePath(filepath)
    let filename = getFileBaseNameFromFilePath(filepath)

    let filepath_declAndDep = joinPath(path.resolve(dirPath), getNameOfSaveDeclAndDepFileFromFilename(filename))
    let filepath_posMap = joinPath(path.resolve(dirPath), juWalk_getNameOfSavePosMapFileFromFilename(filename))

    if (!fs.existsSync(filepath_declAndDep) || !fs.existsSync(filepath_posMap)) {
        let parser_args = {
          acorn_args: {
            input: fs.readFileSync(filepath, "utf8"),
            options,
            startPos
          },
          ju_args: createJuArgsForParse(filepath, ...param_juArgs)
        }
        await ju_parse(parser_args)
    }

    return await Promise.all([readASyncExportDfFileToJsonObject(filepath_declAndDep), readASyncExportDfFileToJsonObject(filepath_posMap)]).then(
      (arr_readedFile) => {
        return {[str_ju_parse]: arr_readedFile[0], [str_ju_walk]: arr_readedFile[1]}
      }
    )
    // return await getContentFileIfExistElseComputeAndSave(filepath_declAndDep,ju_parse,filepath,parser_args)
}

// DEBUG : param_juArgs = true , 7
export async function getDepsFromFilePath(obj_deps, filepath_code, options = {sourceType: "module"}, startPos = 0, ...param_juArgs) {
    let result_of_parse = await readResultFileJuParse(filepath_code, options, startPos, ...param_juArgs)
    return {...getNeededDeps(obj_deps, result_of_parse[str_ju_parse], getPosMap(result_of_parse[str_ju_walk])), [str_mainCallExpression]: result_of_parse[str_ju_walk][str_mainCallExpression]}
}
