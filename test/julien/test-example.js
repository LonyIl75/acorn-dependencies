// TODO clean dep and decl only in the end of the node => != verify is set before
// TODO : allow afterward declaration => we need to check that intersection of declaration and dep is empty

import path from "path"
import {juNodeDeclOrDep} from "../../acorn/src/julien/_node.js"
import {concatStringAndPropertyValue} from "../../acorn/src/julien/_nodeName.js"
import getDepsOfImportedFile,{str_props_import,str_import,str_dependencies} from "../../julien/getDepsOfImportedFile.js"
import {str_filepath}  from "../../acorn/src/julien/token/configToken.js"

let path_code = path.resolve("./test/julien/testImport/main.js")
let function_name = "isMatchObjectName"

let _obj_import = {[str_dependencies]:juNodeDeclOrDep.factoryFromProps({ju_name:function_name}),...juNodeDeclOrDep.factoryFromProps({ju_name: concatStringAndPropertyValue(str_import,path_code)}),[str_props_import]:{[str_filepath]:path_code}}
let r_fileContent = await getDepsOfImportedFile({[path_code] :_obj_import})
console.log(r_fileContent.reduce((_str,elm)=> _str + elm,""))
