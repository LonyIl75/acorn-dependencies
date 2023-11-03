import {getExtendedField, setProp} from "../../../acorn/src/julien/primitives/Object.js"
import {getDeclAndDep} from "../../../acorn/src/julien/DeclAndDep/declAndDep.js"

import {str_program, str_props, str_pos, str_posMap} from "../../../acorn/src/julien/token/configToken.js"
import {joinNodeNames} from "../../../acorn/src/julien/_nodeName.js"
import {countOfElementThatMatchRegExpInArray} from "../../../acorn/src/julien/primitives/Array.js"
import {createRegExp_from_str} from "../../../acorn/src/julien/misc/_regexp.js"
import {appendSuffixContext} from "../../../acorn/src/julien/_context.js"
import {str_callExpression} from "./ju_walk.js"

export function addNodeToPosMap(obj, node, debug_name) {
    let juWalkNode = obj.factoryNode(node)
    getExtendedField(obj, str_posMap).addObjTo([str_program], juWalkNode)
}

export function ju_walk_iterate(ju_walk_object, ast, mainCallExpressionPosMap = {}) {
    ju_walk_object.cst(1)
    ju_walk_object.simple(ast,
      {
      FunctionDeclaration(node) {
        addNodeToPosMap(ju_walk_object, node, "FunctionDeclaration")
      },
      VariableDeclaration(node) {
        addNodeToPosMap(ju_walk_object, node, "VariableDeclaration")
      },
      AssignmentExpression(node) {
        if (node.left.type === "MemberExpression")addNodeToPosMap(ju_walk_object, node, "AssignmentExpression")
      },
      ImportDeclaration(node) {
        let arr = node.specifiers
        let [firstSpecifier, lastSpecifier] = [arr[0], arr[arr.length - 1]]
        let [pos1, pos2] = [{start: node.start, end: firstSpecifier.start}, {start: lastSpecifier.end, end: node.end}]
        let juWalkNode = ju_walk_object.factoryNode(node)
        setProp(juWalkNode[node.ju_name][str_props], str_pos, [pos1, pos2])
        getExtendedField(ju_walk_object, str_posMap).addObjTo([str_program], juWalkNode)
      },
      ClassDeclaration(node) {
        addNodeToPosMap(ju_walk_object, node, "ClassDeclaration")
      },
      ExportNamedDeclaration(node) {
        addNodeToPosMap(ju_walk_object, node, "ExportNamedDeclaration")
      },
      ImportSpecifier(node) {
        addNodeToPosMap(ju_walk_object, node.imported, "ImportSpecifier")
      },
      ImportDefaultSpecifier(node) {
        addNodeToPosMap(ju_walk_object, node.local, "ImportDefaultSpecifier")
      },
      /* ImportExpression(node) {
        console.log(ju_walk_object,node,'ImportExpression')
      }, */
      CallExpression(node) {
        let count_str = countOfElementThatMatchRegExpInArray(Object.keys(mainCallExpressionPosMap), createRegExp_from_str(node.ju_name)).toString()
        let new_ju_name = appendSuffixContext(joinNodeNames(str_program, str_callExpression), node.ju_name, count_str)
        let juWalkNode = ju_walk_object.factoryNode({...node, ju_name: new_ju_name})

        mainCallExpressionPosMap = {...mainCallExpressionPosMap, ...juWalkNode}
      }
      // "ExportAllDeclaration",
    // "ExportDefaultDeclaration",
    // "ExportNamedDeclaration",
    }

    )
    return [ju_walk_object, mainCallExpressionPosMap]
  }
