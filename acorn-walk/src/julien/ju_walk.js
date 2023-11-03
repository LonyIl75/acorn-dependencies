import * as walk from "../index.js"
import {getExtendedFieldValue, s_getProp, setProp, extendedField} from "../../../acorn/src/julien/primitives/Object.js"
import {getSaveFilename, getFileDirPathFromFilePath, getFileBaseNameFromFilePath, joinPath, writeSyncJsonObjectToExportDfFile} from "../../../acorn/src/julien/primitives/File.js"
import {declAndDep_str, getDeclAndDep} from "../../../acorn/src/julien/DeclAndDep/declAndDep.js"
import {addNodeFunctionality} from "../../../acorn/src/julien/_node.js"
import {declarationStatement} from "../../../acorn/src/julien/token/mapLabelToken.js"
import {str_program, str_props, str_pos, str_posMap} from "../../../acorn/src/julien/token/configToken.js"
import {camelize_joinArrStr} from "../../../acorn/src/julien/primitives/String.js"
const notSetLimit = -1

let ju_base = {}

let functionStatement = ["ArrowFunctionExpression"]

export const df_declarationStatement = null

export const str_callExpression = "callExpression"
const str_main = "main"
export const str_mainCallExpression = camelize_joinArrStr([str_main, str_callExpression])

function getNameOfSavePosMapFileFromFilename(filename) {
    return getSaveFilename(str_posMap, filename)
}

export function juWalk_getNameOfSavePosMapFileFromFilename(filepath) {
    return joinPath(getFileDirPathFromFilePath(filepath), getNameOfSavePosMapFileFromFilename(getFileBaseNameFromFilePath(filepath)))
  }

export let ju_walk = {};
(function(ju_walk) {
    function extendFctBaseVisitor(obj, fct_base) {
        return (node, ...args) => {
            let isDepthed = obj.depthedStatement === df_declarationStatement ? true : obj.depthedStatement.includes(node.type)
            let embeded_fct = null
            if (isDepthed) embeded_fct = (_this, _node, ..._args) => {
                ++_this.depth
                fct_base(_node, ..._args)
                --_this.depth
            }
            else embeded_fct = (_this, _node, ..._args) => fct_base(_node, ..._args)
            embeded_fct(obj, node, ...args)
        }
    }
    function extendMyBaseVisitor(obj, my_base = ju_base) {
        let fct = null
        return Object.entries(walk.base).reduce((acc, elm) => {
            if (acc.hasOwnProperty(elm[0])) fct = extendFctBaseVisitor(obj, acc[elm[0]])
            else fct = extendFctBaseVisitor(obj, elm[1])
            return {...acc, [elm[0]]: fct}
        }, my_base)
    }

    ju_walk.factoryNode = function(node) {
        return {[node.ju_name]: {[declAndDep_str]: {...getDeclAndDep(node)}, [str_props]: {ju_name: node.ju_name, pos: [{start: node.start, end: node.end}]}, type: node.type}}
    }
    // get name_node in ju_walk[str_posMap][str_program]
    ju_walk.getNodeInPosMap = function(name_node) {
        return s_getProp(getExtendedFieldValue(ju_walk, str_posMap, str_program), name_node, undefined)
    }

    ju_walk.setPosOfNodeInPosMap = function(name_node, pos) {
        let node = ju_walk.getNodeInPosMap(name_node)
        setProp(node[str_props], str_pos, pos)
    }

    ju_walk.cst = function(limit = notSetLimit, _declarationStatement = undefined, _baseVisitor = undefined) {
        extendedField(ju_walk, str_posMap, {isObject: true})
        addNodeFunctionality(ju_walk, str_posMap)
        ju_walk[str_posMap].cst({})

        ju_walk.limit = limit
        ju_walk.depth = 0
        ju_walk.depthedStatement = (_declarationStatement === undefined
? [...declarationStatement, ...functionStatement]
        : _declarationStatement === df_declarationStatement
? df_declarationStatement
        : [..._declarationStatement])
        if (ju_walk.limit === notSetLimit) ju_walk.depthedStatement = []
        ju_walk.baseVisitor = _baseVisitor === undefined ? extendMyBaseVisitor(ju_walk) : extendMyBaseVisitor(ju_walk, _baseVisitor)
    }

    ju_walk.simple = function simple(node, visitors, state, override) {
        (function c(node, st, override) {
          let type = override || node.type, found = visitors[type]
          if (ju_walk.limit !== notSetLimit && ju_walk.depth > ju_walk.limit + 1) return
          ju_walk.baseVisitor[type](node, st, c)
          if (found) found(node, st)
        })(node, state, override)
    }

    ju_walk.juWalk_writeSavedDeclAndDep = function(path_code, addedPosMap) {
            return writeSyncJsonObjectToExportDfFile(juWalk_getNameOfSavePosMapFileFromFilename(path_code), {[str_posMap]: getExtendedFieldValue(ju_walk, str_posMap), [str_mainCallExpression]: addedPosMap})
    }
})(ju_walk)
