import {df_scopeDepth} from "./DeclAndDep/declAndDep.js"
import {addCallContextNameToError} from "./primitives/Error.js"

export function createJuArgsForParse(filepath, isEnabledSaveDeclAndDep = false, scopeDepth = df_scopeDepth) {
    let ju_args = {filepath, isEnabledSaveDeclAndDep, scopeDepth}
    addCallContextNameToError("createJuArgsForParse", verifyJuArgsForParse, ju_args)
    return ju_args
  }

  export function getJuArgsFromParserThis(obj) {
    return createJuArgsForParse(obj.filepath, obj.isEnabledSaveDeclAndDep, obj.scopeDepth)
  }

  export function verifyJuArgsForParse(ju_args) {
    if (!ju_args?.filepath) throw new Error("filepath is not defined")
    if (ju_args?.isEnabledSaveDeclAndDep && !ju_args?.scopeDepth > 0) throw new Error(`isEnabledSaveDeclAndDep is ${ju_args?.isEnabledSaveDeclAndDep} (<=> true ) scopeDepth but is ${ju_args?.scopeDepth} (<=> not defined) `)
  }
