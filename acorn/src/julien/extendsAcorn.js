import {str_juAnnotation, juNodeDeclOrDep, initExtendedFieldJuNode, str_juType, getFirstNotNullPropNameOfNode, renameJuNodes, juNodeDeclOrDep_extractJuProps} from "./_node.js"
import {isPropsKey, joinCharOfNodeNames, getMemberFieldRegex, joinCharOfStaticClassElement, unionNodeNames, joinNodeNameAndProperties, getJuNameAndCtxOfLabelledStatement, pairCharOfVariableDeclaration, getJuNameOrName, joinCharOfNodeNames_regex, isMatchExtendedMember, _getJuNameFromNode, joinNodeNames, getJuNameOfNode, charUnionNodeNames, concatStringAndPropertyValue} from "./_nodeName.js"
import {getCurrentContextSuffix, removeContextSuffixFromIthContextStr, matchAllExceptLastSuffix, removeLastContextSuffix, getJuNameFromNode, getIthContextSuffix, appendSuffixContext} from "./_context.js"
import {BIND_OUTSIDE, functionFlags, SCOPE_ARROW} from "../scopeflags.js"
import {getLabelFromTokenType} from "../tokentype.js"
import {types as tt} from "../mapTokentype.js"
import {boolOrUnknown} from "./boolOrUnknown.js"
import {ju_tt} from "./token/addedKeywordToken.js"
import {isIndexableTypeLabel, arrIdentifierToken, isDeclarationStatement, typeOfExportOrImport} from "./token/mapLabelToken.js"

import {verifyJuArgsForParse} from "./_todo.js"

import {nameSetMethod, nameGetMethod, concatArrObjects, setExtraObjectFromPropsArray, str_set, getObjectFromPropsArray, setProp, strArrToFieldName, setExtendedFieldValue, getExtendedFieldValue, s_getProp, setPropAddIfExist, isSubObjectPathProps, getExtendedField, extendedField, isNotEmptyObject, objectElements_notMatch_regex, objectElements_keyVerifyFct, setExtraValueFromPropsArray} from "./primitives/Object.js"
import {arrayToString, strEd} from "./primitives/String.js"
import {addCallContextNameToError} from "./primitives/Error.js"
import {isFunction} from "./primitives/Function.js"
import {isNotEmptyArray} from "./primitives/Array.js"

import {setDeclAndDep, writeSavedDeclAndDep, savedIsEnabled, getDeclAndDep, depAndDeclFieldName, getDependenciesName, getDeclarationsName, juParser_getNameOfSaveDeclAndDepFileFromFilename, currDepAndDeclFieldName, parser_currDeclsAndDeps_options, str_abreviation_currDeclAndDep, df_scopeDepth} from "../julien/DeclAndDep/declAndDep.js"
import {initNotDeclsAndDepsFields, initDeclsAndDepsFields} from "../julien/DeclAndDep/main.js"
import {str_program, str_props, str_posMap, str_filepath} from "./token/configToken.js"
import {getMatchAndPosFromRegexMatchingFullMatch} from "./misc/_regexp.js"
import {isNullOrUndefined} from "./primitives/primitive.js"
import {resolveRelative, getFileDirPathFromFilePath} from "./primitives/File.js"
import {DeclAndDepObject} from "../julien/DeclAndDep/DeclAndDepObject.js"

// -------------------------------------------------------

// TODO : move to another more meaning full file

export function setCurNode(obj, _node) {
  obj.curNode = _node
}

// A FAIRE REFACTOR general
// instantiate node with obj[str_juType]
export function createNodeJuTypeAndResetJuTypeGeneral(obj, node) {
  extendedField(node, str_juType, obj.config_extendedFields[str_juType])
  node[str_juType].cst(obj[str_juType].get())
  obj[str_juType].reset()
}
export function maybeInformativeCommentEmbdedding(obj, fct, _this, ...args) {
  obj.maybeInformativeComment = boolOrUnknown.getTrue()
  let res = fct(_this, ...args)
  // end the potential comment to precise the type of the variables declared
  obj.maybeInformativeComment = boolOrUnknown.getUnSettedValue()
  return res
}

export function litteralTreatmentEmbdedding(obj, fct, _this, ...args) {
  let prev_litteralTreatment = obj.litteralTreatment
  obj.litteralTreatment = true// TODO : REFACTOR with extendedField :
  let res = fct(_this, ...args)
  obj.litteralTreatment = prev_litteralTreatment
  return res
}

// MISC
// TODO RE ORGANISE :

// /* : val_type *\/
const typeCommentRegex = /^\s*\:\s*(\S+)/ // eslint-disable-line no-useless-escape

function getTypeFromComment(_str) {
  let res = _str.match(typeCommentRegex)
  return res ? res[1] : null
}

// /* @annotation : val_type *\/
const typeAnnotationFunctionRegex = /^\s*@annotation\s*:\s*(\S+)/

function getAnnotationFunctionFromComment(_str) {
  let res = _str.match(typeAnnotationFunctionRegex)
  return res ? res[1] : null
}

// scopeDepth == number of scope "{"
export function limitationDepthIsEnabled(obj) {
    return obj.scopeDepth !== df_scopeDepth
}

export function getArrNameOfScopeStack(obj) {
  return obj.scopeStack.map((elm) => elm.scopeId)
}

function getScopeStackPath(obj) {
  return arrayToString(getArrNameOfScopeStack(obj))
}

export function getPosMap(obj) {
  return obj[str_posMap]
}

// -------------------------------------------------------
export function getPropsPropertyOfNode(node) {
  return objectElements_keyVerifyFct(node, isPropsKey, charUnionNodeNames)
}

export function initBasePropsIfNotExists(obj_props) {
  if (!obj_props.hasOwnProperty(str_props))obj_props[str_props] = {}
}

export function updateBaseProps(node) {
  let obj_props = getPropsPropertyOfNode(node)
  initBasePropsIfNotExists(obj_props)
  node[str_props] = {...juNodeDeclOrDep_extractJuProps(node), ...obj_props[str_props]}
}

export function nodeToJsonSave(node) {
  return {...getDeclAndDep(node), ...getPropsPropertyOfNode(node), type: node.type}
}

export function saveDeclAndDepOfNode(obj, node) {
  let invalidValue = null

  let actual_save = getDeclAndDep(obj)

  updateBaseProps(node)

  let res_update_save = setExtraObjectFromPropsArray(actual_save, getArrNameOfScopeStack(obj), nodeToJsonSave(node), invalidValue, setPropAddIfExist)
  return res_update_save !== invalidValue ? actual_save : res_update_save
}

// if [...] set the declAndDep of object and save it to the general declAndDep ([Parser instance ]this)
export function storeAndSaveDeclAndDepOfNode(obj, node, incr = 1) {
  if (limitationDepthIsEnabled(obj) && obj.scopeStack.length <= obj.scopeDepth + incr) {
    setDeclAndDep(node, {...obj[strArrToFieldName("createDeclAndDepFromObj", obj.abrev_currDeclAndDep)]()})
    if (savedIsEnabled(obj)) saveDeclAndDepOfNode(obj, node)
  }
}

/*
 A FAIRE : do the doc
*/

export function ju_parserPropsInit(obj, ju_args) {
  obj.litteralTreatment = false
  obj.isPattern = boolOrUnknown.getUnSettedValue() // maybe need to be remove the only use is to update curNode if is unset or false
  obj.curNode = null // probably need to be remove because now all is based on scope even var declaration
  obj.thisExpressionName = null // name of the current class if any
  obj.contextPosition = [obj.start] // context start positions for example position of the last "{" or "(" pop when context is pop (<=> external extension of context object )

  // this.silentInformation = false ;
  obj.maybeInformativeComment = boolOrUnknown.getUnSettedValue()

  obj.abrev_currDeclAndDep = str_abreviation_currDeclAndDep
  obj.config_extendedFields = {} // explicitly set but set otherwise for each object wich use extendedField
  // describe with wich options each extended field was created

  initExtendedFieldJuNode(obj)
  /*
    if(this.maybeInformativeComment)
     - ju_type: set by ju_skipBlockComment_1, type of the symbol ( variable, expression ) allow to specify potentially imported file by dynamic import but also type of param in fct
     (example: await import(var_1 /* type : "./lib_1/classA.js"*\/ )
     - ju_annotation: set by ju_skipBlockComment_2 , type of the symbol ( function ) allow to specify if a function modify  his arguments so called variable is dependant of that function
      (example : function fct /* annotation : immutable *\/ )

    - ju_posMap :

  */

  initDeclsAndDepsFields(obj) // this.declarations = [] + [methods] , this.dependencies = [] + [methods]
  initNotDeclsAndDepsFields(obj, currDepAndDeclFieldName, obj.abrev_currDeclAndDep, parser_currDeclsAndDeps_options) // this.currDeclarations = {} + [methods] , this.currDependencies = {}+ [methods]

  obj.parenDeps = [] // serve to store dependencies of parenthesized expression

  addCallContextNameToError("ju_parserPropsInit", verifyJuArgsForParse, ju_args) // Error if not correct
  obj[str_filepath] = ju_args[str_filepath] // filepath of the file to parse
  if (ju_args?.isEnabledSaveDeclAndDep)obj.saveDeclAndDepFilename = juParser_getNameOfSaveDeclAndDepFileFromFilename(obj[str_filepath]) // filepath of the result file of the parse
  obj.dirpath = getFileDirPathFromFilePath(obj[str_filepath]) // dirpath of the file to parse
  obj.scopeDepth = ju_args?.scopeDepth ? ju_args.scopeDepth : df_scopeDepth // depth of the scope , currently number of "{"
}

export function ju_enterScope(obj, scope, scopeId, isInit = false) {
  scope.scopeId = isInit && !scopeId ? getLabelFromTokenType(tt._root) : scopeId

  // stack the current dep and decl in dep and decl stack  , rebuild empty current dep and decl and affect it to current dep and decl
  if (!isInit) {
     getExtendedField(obj, getDependenciesName(depAndDeclFieldName)).push(getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName)))
     getExtendedField(obj, getDeclarationsName(depAndDeclFieldName)).push(getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)))

    delete obj[getDeclarationsName(currDepAndDeclFieldName)]
    delete obj[getDependenciesName(currDepAndDeclFieldName)]

    initNotDeclsAndDepsFields(obj, currDepAndDeclFieldName, obj.abrev_currDeclAndDep, parser_currDeclsAndDeps_options)
  }
}
// TODO : remove when curNode is removed if never removed we need to have stack of curNode or something like that trought scope stack
// enterScope + set curNode
export function enterScopeStatementAndSetNodeJuName(obj, node, flagScope = undefined) {
  obj.curNode = node
  obj.enterScope(flagScope === undefined ? obj.currentScope().flags : flagScope, getJuNameOfNode(node))
}

// TODO do the doc
function addPreviousDep(node, res_obj, _renameKeyNode, dep, fct_isbeginWithDeclared = null) {
  let val_obj = {}
  if (isNotEmptyObject(dep)) for (const keyNode of Object.keys(dep)) {
      val_obj = dep[keyNode]

      // TODO : (NOT CORRECT)
      // __FILTER__ : remove all dep that begin with a previously declared variable
      if (isFunction(fct_isbeginWithDeclared))val_obj = objectElements_notMatch_regex(val_obj, fct_isbeginWithDeclared, charUnionNodeNames)

      let ttt = removeLastContextSuffix(keyNode)
      let ttt2 = removeLastContextSuffix(_renameKeyNode)
      // if prefix not already put ( aka not(keyNode or renameKeyNode is subpath of the other)))
      if (!isSubObjectPathProps(ttt, ttt2) && !isSubObjectPathProps(ttt2, ttt)) {
        if (!(node.type === "ClassExpression" || node?.body?.type === "ClassBody")) {
          // rename key of each value with `${_renameKeyNode}.${_key}`
          val_obj = renameJuNodes(val_obj, (_key) => joinNodeNames(_renameKeyNode, _key), (_key) => _key) // if is class then nameClass + ".|_" + classElement
        }
        // `${_renameKeyNode}.${keyNode}`
        _renameKeyNode = joinNodeNames(_renameKeyNode, keyNode)
      }
      // res_obj[`${_renameKeyNode}.${keyNode}`] = {...prev ,...val_obj}
      setPropAddIfExist(res_obj, _renameKeyNode, val_obj)
    }
}

/*
 A FAIRE : do the doc
*/
export function ju_exitScope(obj, node, incr) {
    // all variable declaration of nodeName : obj["currDeclarations"][nodeName]
    let innerDeclarations = s_getProp(getExtendedFieldValue(obj, getDeclarationsName(currDepAndDeclFieldName)), getJuNameOfNode(node), {})
    // set declAndDep of node and obj
    storeAndSaveDeclAndDepOfNode(obj, node, incr)

    // get previous currDeclarations (aka last element of declarations)
    let _b = getExtendedField(obj, getDeclarationsName(depAndDeclFieldName)).pop()
    // set currDeclarations to previous currDeclarations
    setExtendedFieldValue(obj, getDeclarationsName(currDepAndDeclFieldName), _b.get())

    let currDep = getExtendedFieldValue(obj, getDependenciesName(currDepAndDeclFieldName))
    let currDecl = getExtendedFieldValue(obj, getDeclarationsName(currDepAndDeclFieldName))

    let arr_keys_outerDeclaration = []
    let tmp = currDecl

    let arr_scope_name = getArrNameOfScopeStack(obj)
    let currScope = arr_scope_name.pop() // assert == obj.getCurrNodeId()

    for (const nameProp of arr_scope_name) {
      // TODO: change only currScope
      if (tmp.hasOwnProperty(nameProp)) {
        tmp = tmp[nameProp]
        arr_keys_outerDeclaration = [...arr_keys_outerDeclaration, ...Object.keys(tmp)]
      }
    }

    let allDeclared_varId = [...arr_keys_outerDeclaration, ...Object.keys(innerDeclarations)]

    // verify if a string begin with a declared variable followed by ${joinCharOfNodeNames_regex} (".")
    let fct_isbeginWithDeclared = isNotEmptyArray(allDeclared_varId) ? (_str) => isMatchExtendedMember(_str, joinCharOfNodeNames, allDeclared_varId) : null
    // TODO : replace by juNameFromNode or currScopeId
    // renameKeyNode =  juNameOrName of node or juNameOrName of node["key"] or uNameOrName of node["id"]
    let renameKeyNode = getFirstNotNullPropNameOfNode(node)
    if (!renameKeyNode) renameKeyNode = obj.getCurrScopeId()

    let res_obj = {}
    _b = getExtendedFieldValue(obj, getDependenciesName(depAndDeclFieldName)).pop()
    // get previous currDependencies (aka last element of dependencies)
    res_obj = _b.get()
    // remove all dep that begin with a previously declared variable and add the rest to res_obj (also concat renameKeyNode/curr(Node|Scope) to each key of res_obj )
    addPreviousDep(node, res_obj, renameKeyNode, currDep, fct_isbeginWithDeclared)
    // UPDATE : currDependencies = res_obj
    setExtendedFieldValue(obj, getDependenciesName(currDepAndDeclFieldName), {...res_obj})
}

export function ju_parseVar(obj, node) {

}

export function ju_skipBlockComment(obj, _str) {
  let st1 = "" ; let st2 = ""
  st1 = ju_skipBlockComment_1(obj, _str)
  if (!st1)st2 = ju_skipBlockComment_2(obj, _str)
}

export function ju_skipBlockComment_1(obj, _str) {
  let str_type = getTypeFromComment(_str)
  if (str_type) setExtendedFieldValue(obj, str_juType)(str_type)
  return str_type
}

// A FAIRE : verify "context" == function token
// if there is annotation set str_juAnnotation of parser to annotation retrieved by regex matching
export function ju_skipBlockComment_2(obj, _str) {
  let str_annotation = getAnnotationFunctionFromComment(_str)
  if (str_annotation) setExtendedFieldValue(obj, str_juAnnotation)(str_annotation)
  return str_annotation
}

// compute reamining prop of node (str_type trough obj[str_juType]  or ju_name with props of node )
export function ju_finishNodeAt(obj, node) {
  if (!obj[str_juType].isNotSet()) {
    /* if(!obj.silentInformation ) */createNodeJuTypeAndResetJuTypeGeneral(obj, node)
  } else if (!getJuNameOfNode(node))node.ju_name = getJuNameFromNode(obj, node, undefined, obj.litteralTreatment)
  // TODO : inutile remove :
  if (node.init)node.init.ju_name = joinNodeNames(getJuNameFromNode(obj, node, undefined, obj.litteralTreatment), getJuNameFromNode(obj, node.init, undefined, obj.litteralTreatment))
  if (node.right) node.right.ju_name = joinNodeNames(getJuNameFromNode(obj, node, undefined, obj.litteralTreatment), getJuNameFromNode(obj, node.right, undefined, obj.litteralTreatment))
}

// set ju_name of arrow function node
export function ju_parseArrowExpression_init(obj, node, params, isAsync) {
  // init the current parenthesis dependencies array
  // if (obj.parenDeps[obj.parenDeps.length])
  obj.parenDeps.push({})
  // TODO REFACTOR :
  // Extract function params declaration
    let arrParamsName = params?.map((elm) => getJuNameOrName(elm))
    if (isNotEmptyArray(arrParamsName)) {
      let tmp = getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName)).getProps([obj.getCurrScopeId()])
      tmp = isNotEmptyObject(tmp)
? Object.entries(tmp)?.reduce((_obj, elm) => {
        if (arrParamsName.includes(elm[0])) return _obj
        return {..._obj, [elm[0]]: elm[1]}
      }, {})
: tmp

      if (isNotEmptyObject(tmp))getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName))[`${str_set}Props`]([obj.getCurrScopeId()], tmp)
      else if (tmp) delete getExtendedFieldValue(obj, getDependenciesName(currDepAndDeclFieldName))[obj.getCurrScopeId()]
    }
  let [ju_name, isLitteral] = _getJuNameFromNode(obj, obj.curNode, obj.litteralTreatment) // TODO .curNode replace by currScopeName
  // TODO : create InitJuName :
  // ju_name = boolOrUnknown.isTrue(isLitteral) && /[Aa]rrow(.+)/.test(ju_name) ? getIthContextSuffix(DeclAndDepObject.createDeclsDepsObj(obj.currDeclarations,  obj.currDependencies),ju_name)[0] :  obj.getCurrScopeId()
  // node.ju_name = ${ju_name}.arrow[i]
  ju_name = getIthContextSuffix(obj, getLabelFromTokenType(ju_tt.arrow), ju_name)[0]
  setProp(node, "ju_name", ju_name)

  obj.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW, getJuNameOrName(node))

  getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], concatArrObjects(params.map((param_node) =>
  juNodeDeclOrDep.factory(param_node))))
}

/* export function ju_varStatement(node){
  setDeclAndDep(node,{...node[strArrToFieldName("createDeclAndDepFromObj",abrev_declsAndDepsOfNode)](df_juName)})
} */

export function ju_parseMaybeAssign_init(obj, left) {
        let left_name = getJuNameOrName(left)
        // TODO : append obj[prop] = right , (SubscriptExpression)
        // pattern : obj.prop = right
        // append left :'obj.prop'  to currDeclarations  and remove it from currDependencies if any
        getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)).addObjTo([left_name], juNodeDeclOrDep.factory(left))
        let super_object = getObjectFromPropsArray(getExtendedFieldValue(obj, getDependenciesName(currDepAndDeclFieldName)),
        getArrNameOfScopeStack(obj), null)
        if (super_object !== null) delete super_object[left_name]
        // TODO : enterScope for all root of left_name , then all root.something will be declare inside root/
        /* For example declAndDecl = { root : {
          root.something : {...},
          declarations : {...},
          dependencies : {...}

        }} */
        // Enter in VariableDeclaration Scope (left_name)
        obj.enterScope(obj.currentScope().flags, left_name, false)
}

export function ju_parseMaybeAssign_clean(obj, left) {
  // TODO RE DO // getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName)).addObjTo([getMatchAndPosFromRegexMatchingFullMatch(getJuNameOrName(left), getMemberFieldRegex(joinCharOfNodeNames)).match], juNodeDeclOrDep.factory(left))
  let varName = getMatchAndPosFromRegexMatchingFullMatch(getJuNameOrName(left), getMemberFieldRegex(joinCharOfNodeNames)).match
  let beg_arr = getArrNameOfScopeStack(obj)
  beg_arr.pop()
  setExtraObjectFromPropsArray(getDeclAndDep(obj), [...beg_arr, varName, getDependenciesName(depAndDeclFieldName), varName], juNodeDeclOrDep.factory(left))
  obj.exitScope(left)
}

export function ju_parseExprSubscripts(obj, _node) {
  let ju_node = juNodeDeclOrDep.factory(_node)
  // if value can be a deps
  if (ju_node && arrIdentifierToken.includes(_node.type) && !matchAllExceptLastSuffix().test(getJuNameOrName(_node))) { // ObjetExpression Added : case : OBJECT LITERAL
    if (!isNotEmptyArray(obj.parenDeps) || obj.curContext().token !== "(") {
      // if we aren't inside a call parenthesis , e.g (function(...){...})(HERE) then parsed value val_i of the list val_1,val_2,... is a currDependency
      getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName))[`${str_set}FromSetObj`]([obj.getCurrScopeId()], ju_node)
    } else {
      // else parsed value of the list is a parenthesis dependency
      obj.parenDeps[obj.parenDeps.length - 1] = {...obj.parenDeps[obj.parenDeps.length - 1], ...ju_node}
    }
  }
}

export function ju_parseBindingAtom(obj, fct) {
   return maybeInformativeCommentEmbdedding(obj, fct, obj)
}

const str_immutable = "immutable"
export function parseMeaningFullAtomLitteral(obj) {
  return litteralTreatmentEmbdedding(obj, (_this) => _this.parseExprAtom(), obj)
}
export function ju_parseSubscript(obj, base, exprList) {
  // Retrieve JuNode of the function called
  let name_callExpr = getJuNameOrName(base)
  let juNode_function = juNodeDeclOrDep.factoryFromProps(getDeclAndDep(obj)[str_program][name_callExpr][str_props])

  // if the function isnt annotated as immutable
  if (!(juNode_function?.annotation && juNode_function.annotation === str_immutable)) {
    // then
    let fct_m = (_this, fct_props, node_expr) => {
      let name_curNode = getJuNameOrName(_this.curNode) // TODO .curNode replace by currScopeName
      let props_val = juNodeDeclOrDep._getValue(fct_props)
       // 1- if we are linked to a node (curNode) and this node isn't the actual function we append this function to the dependencies of the curNode
      if (name_curNode && !name_curNode === props_val.ju_name) return getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName)).addObjTo([getJuNameOrName(_this.curNode)], fct_props)
        else if ((node_expr?.type === "Identifier" || node_expr?.type === "AssignmentExpression") && _this.DeclAndDep[str_program][getJuNameOrName(node_expr)]) {
          // 2- else if the node_expr represent a variable (lvalue) and this variable was previously declared inside program then we append this function to the dependencies of the variable
          return setExtraObjectFromPropsArray(_this.DeclAndDep[str_program][getJuNameOrName(node_expr)].dependencies, [getJuNameOrName(node_expr), props_val.ju_name], props_val)
        }
      }
  // ? append function to dep curNode
  fct_m(obj, juNode_function) // ?1-

  // ? append val_1,val_2,... to dep curNode
  for (let node_expr of exprList) {
    fct_m(obj, juNode_function, node_expr)// ?2-
  }
  }
}

export function ju_parseExprAtom(obj, id_node) {
  // add id if not already in dep or decl
  getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName))[`${str_set}FromSetObj`]([obj.getCurrScopeId()], juNodeDeclOrDep.factory(id_node))
}

// TODO : do the doc
export function ju_parseDynamicImport_clean(obj, _node) {
  let node_name = joinNodeNames(obj.getCurrScopeId(), getLabelFromTokenType(tt._import))
  let ju_node = juNodeDeclOrDep.factory(_node)
  if (ju_node)getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName)).addObjTo([node_name], ju_node)
  return _node
}

export function ju_parseParenAndDistinguishExpression_init(obj) {
  // init the current parenthesis dependencies array
  obj.parenDeps.push({})
}

export function ju_parseParenAndDistinguishExpression_clean(obj) {
  // add current parenthesis dependencies to currentDependencies
  let tmp = obj.parenDeps.pop()
  if (tmp)getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], tmp)
}

// prop.ju_name == `${juName(prop.key)}["kind"]` ex `${juName(prop.key)}["method"]
export function ju_parsePropertyName_init(obj, prop, kind) {
  setProp(prop, "ju_name", getJuNameFromNode(obj, prop.key, undefined, obj.litteralTreatment) + pairCharOfVariableDeclaration.encloseStr(kind))
}

export function ju_parseFunctionBody(obj, node) {
  // setCurNode(node)
    /* let arrParamsName = node.params?.map((elm) =>getJuNameOrName(elm))
    if (arrParamsName)  {
      getExtendedField(obj,getDependenciesName(currDepAndDeclFieldName)).setProp(obj.getCurrScopeId(),Object.entries(getExtendedField(obj,getDependenciesName(currDepAndDeclFieldName)) .getProp(obj.getCurrScopeId()))?.reduce((_obj,elm) => {
        if(arrParamsName.includes(elm[0])) return _obj
        return {..._obj , [elm[0]] : elm[1] } },{}))

    } */
}

export function _ju_parseBindingAtom(obj, _type, res_node) {
  switch (_type) {
    // declare all the name in ArrayPattern ([a,b,c] => declare a,b,c)
    case tt.bracketL:
      getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], concatArrObjects(res_node.elements, (element) => juNodeDeclOrDep.factory(element)), undefined, getJuNameOrName(res_node))
      break
    // declare all the name in ObjectPattern ({a,b,c} => declare a,b,c)
    case tt.braceL:
      getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], concatArrObjects(res_node.properties, (propertie) => juNodeDeclOrDep.factory(propertie)), undefined, getJuNameOrName(res_node))
      break
  }
}

export function ju_checkLValSimple(obj, expr, isBind, bindingType) {
  let ju_node = juNodeDeclOrDep.factory(expr)
  switch (expr.type) {
    case "Identifier":
      // TODO : do the doc
      if ((!isBind || bindingType === BIND_OUTSIDE) && obj.curContext().isExpr) {
        getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName))[`${str_set}FromSetObj`]([obj.getCurrScopeId()], ju_node)
      }

      if (isBind && bindingType !== BIND_OUTSIDE) {
        // TODO : do the doc
        getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], ju_node)
        // TODO : REFACTOR + VERIFY isPattern pertinence
        if (boolOrUnknown.isFalseOrUnknown(obj.isPattern) && (obj.context.length < 2 ? !obj.curContext().isExpr : expr.start < obj.contextPosition[obj.contextPosition.length - 2] && !obj.context[obj.context.length - 2].isExpr)) {
          obj.curNode = expr
        }
      }
  }
}

const arr_valPatternField = ["ObjectPattern", "ArrayPattern"]

const arr_valInnerPatternField = ["Property", "AssignmentPattern", "RestElement"]

export function ju_checkLVal(obj, type_checkVal, fct, ...args) {
  let _setIsPattern = (_arr_type_checkVal) => {
    let val = _arr_type_checkVal.includes(type_checkVal) ? boolOrUnknown.retEnumTrueIfUnknownElseSelf(obj.isPattern) : boolOrUnknown.retEnumFalseIfUnknownElseSelf(obj.isPattern)
    return setProp(obj, "isPattern", val)
  }

  // update this.isPattern accordingly to expr.type
  switch (type_checkVal) {
    case "ValPattern" :
      _setIsPattern(arr_valPatternField)
      break
    case "ValInnerPattern" :
      _setIsPattern(arr_valInnerPatternField)
      break
  }

  fct(...args)

  obj.isPattern = boolOrUnknown.getUnSettedValue()
}

export function ju_parseTopLevel_clean(obj, _node) {
      // setDeclAndDep of root node aka program
      storeAndSaveDeclAndDepOfNode(obj, _node)
      // write decl and dep of program
      if (savedIsEnabled(obj)) writeSavedDeclAndDep(obj)
      return _node
}
// TODO do the doc starttype
export function ju_parseStatement_init(obj, _str_num_context, __name, _context, starttype) {
    let str_num_context = _str_num_context
    let _name = __name
    // set the name of the node ( ex : nameOfStatement[nbOfThisStatementPreviouslySeen] )
    if (!_name && isIndexableTypeLabel(_context)) {
      _name = obj.getCurrScopeId()
      if ((!str_num_context)) {
        let context_1 = _context || (_context || starttype.keyword)
        let res_pair = getIthContextSuffix(obj, context_1, _name)
        _name = res_pair[0]
        str_num_context = res_pair[1]
      } else if (_context) {
        let n_name = removeContextSuffixFromIthContextStr(_name, _context, str_num_context)
        let res_pair = getIthContextSuffix(obj, _context, n_name)
        str_num_context = res_pair[1]
        _name = res_pair[0]
    }
  }
    return [str_num_context, _name]
}

export function df_name_appendSuffix(name, token, str_num) {
  // `${getLabelFromTokenType(token)}[${str_num}]`
  return appendSuffixContext(name, getLabelFromTokenType(token), str_num)
}

function ju_parseNStatement_init(obj, node, str_num, _name, token) {
  // TODO : df_name_appendSuffix <=> getJuNameAndCtxOfLabelledStatement no ? wtf
  if (_name === undefined) _name = obj.getCurrScopeId()// df_name_appendSuffix(obj.getCurrScopeId(), token, str_num)
  node.ju_name = getJuNameAndCtxOfLabelledStatement(obj, node, _name, str_num, getLabelFromTokenType(token))[0]
}

export function ju_parseDoStatement_init(obj, node, str_num_do, _name) {
    ju_parseNStatement_init(obj, node, str_num_do, _name, tt._do)
}

export function ju_parseForStatement_init(obj, node, str_num_for, _name) {
 ju_parseNStatement_init(obj, node, str_num_for, _name, tt._for)
}

export function ju_parseFunctionStatement_init(obj, node) {
   // TODO REFACTOR : + TODO : "config_extendedFields"
   if (!obj[str_juAnnotation].isNotSet()) {
    // set the annotation of the node if there is one annotation in the previous comment
    extendedField(node, str_juAnnotation, s_getProp(obj.config_extendedFields, str_juAnnotation, undefined))
    node[str_juAnnotation].cst(obj[nameGetMethod(str_juAnnotation)]())
    obj[str_juAnnotation].reset()
  }
}

export function ju_parseIfStatement_init(obj, node, str_num_if, _name) {
  ju_parseNStatement_init(obj, node, str_num_if, _name, tt._if)
}

export function ju_parseSwitchStatement_init(obj, node, str_num_switch, _name) {
  ju_parseNStatement_init(obj, node, str_num_switch, _name, tt._switch)
  enterScopeStatementAndSetNodeJuName(obj, {...node, type: "SwitchStatement"})
}

export function ju_parseReturnStatement_init(obj, node) {
  // TO VERIFY : add to dep all the returned variables for example return [var1,var2,...]
  let value = node.argument?.arguments ? concatArrObjects(node.argument.arguments, juNodeDeclOrDep.factory, {}) : juNodeDeclOrDep.factory(node.argument)

  if (isNotEmptyObject(value)) switch (node.argument.type) {
  case "NewExpression":
    getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName))[`${str_set}FromSetObj`]([obj.getCurrScopeId()], value)
    break
  case "CallExpression":
    getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName))[`${str_set}FromSetObj`]([obj.getCurrScopeId()], value)
    break
  case "ImportExpression":
    getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName))[`${str_set}FromSetObj`]([obj.getCurrScopeId()], value)
    break
  /*
  default :
  this.currDependencies[ this.getCurrScopeId() ] = [...this.currDependencies[ this.getCurrScopeId() ] ? this.currDependencies[ this.getCurrScopeId() ] : [], node.argument.name]
  break
  */
  }
}

// TODO-1 create setter fort scopeId and
// TODO-1 remove all setProp and replace by setter
export function ju_parseSwitchStatement_set(obj, node, isCase) {
  let tmp_cur = obj.getCurrScopeId()
  // set scopeId as a case  one
  if (isCase) setProp(obj.currentScope(), "scopeId", appendSuffixContext(tmp_cur, getLabelFromTokenType(tt._case), node.cases.length - 1))
  // set scopeId as a case default one
  else setProp(obj.currentScope(), "scopeId", joinNodeNameAndProperties(tmp_cur, getLabelFromTokenType(tt._default)))
}

export function ju_parseSwitchStatement_clean(obj) {
   // set the scopeId as a switch one :
   setProp(obj.currentScope(), "scopeId", obj.getCurrScopeId())
}

export function ju_parseCatchClauseParam_getName(obj) {
  // get the node_name from the actual currAndDecl and the context id (ex : `${contextId}[${nb of context in currAndDecl}]`)
  return getIthContextSuffix(obj, getLabelFromTokenType(tt._catch), obj.getCurrScopeId())
}

export function ju_parseTryStatement_init(obj, node, str_num_try, _name) {
  ju_parseNStatement_init(obj, node, str_num_try, _name, tt._try)
}

export function ju_parseWhileStatement_init(obj, node, str_num_while, _name) {
  ju_parseNStatement_init(obj, node, str_num_while, _name, tt._while)
}

export function ju_parseWithStatement_init(obj, node, str_num_with, _name) {
  if (_name === undefined && str_num_with) _name = df_name_appendSuffix(obj.getCurrScopeId(), tt._with, str_num_with)

  // TODO : why not  getJuNameAndCtxOfLabelledStatement , i think its because we need to split getJuNameAndCtxOfLabelledStatement before and after parsing
  let with_ju_name = getJuNameFromNode(obj, {...node, type: "WithStatement"}, undefined, obj.litteralTreatment)
  let __name = str_num_with ? _name : joinNodeNames(_name, with_ju_name)
  return [__name, str_num_with]
}

export function ju_parseWithStatement_getName(obj, str_num_with, __name) {
  // TODO : <=> getJuNameAndCtxOfLabelledStatement
  if (!str_num_with) {
    let tmp = getCurrentContextSuffix(obj[strArrToFieldName("createDeclAndDepFromObj", obj.abrev_currDeclAndDep)](), getLabelFromTokenType(tt._with), __name)
    __name = tmp[0]
    str_num_with = tmp[1]
  }
  return [__name, str_num_with]
}

export function ju_parseWithStatement_set(obj, __name, with_ju_name) {
  if (s_getProp(getExtendedFieldValue(obj, getDependenciesName(currDepAndDeclFieldName)), __name, null)) {
    // rename currDependencies  with `${with_ju_name}.${node.ju_name}|${node.ju_name}`
    getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName))[nameSetMethod("Transform")](__name,
      (_object) => renameJuNodes(_object, (prev_name) => unionNodeNames(joinNodeNames(with_ju_name, prev_name), prev_name)))
  }
}

export function ju_parseVar_init(obj, decl) {
    // TODO : REFACTOR :
    // create variable scope and set currentNode to the current lval , ex : let var1 = 0 ,var2 =3 ,... ;
    let new_scope_name = getJuNameFromNode(obj, {...decl, type: "VariableDeclarator"})
    obj.enterScope(obj.currentScope().flags, new_scope_name, false)
    obj.curNode = decl.id
    return new_scope_name
}
// (cf. declareName)
const scope_props = ["functions", "lexical", "var"]

export function ju_getScopeEnv(scope) {
  return scope_props.reduce((_obj, prop) => {
    _obj[prop] = [...scope[prop]]
    return _obj
  }, {})
}

export const df_scopeEnv = scope_props.reduce((_obj, prop) => {
 _obj[prop] = []
return _obj
}, {})

export function ju_mergeScopeEnv(scopeAttributes_1, scopeAttributes_2) {
  for (const prop of scope_props) {
    scopeAttributes_1[prop] = [...scopeAttributes_1[prop], ...scopeAttributes_2[prop]]
  }
}

export function ju_parseVar_clean(obj, node, decl, scope_name) {
  // TODO : RE DO  , why need exitScope and mergeDeclAndDep ???
      // exit variable scope => program : { var1:{...} , declarations : {program : {var1:{...}, }}
      let prev_env = ju_getScopeEnv(obj.scopeStack.length === 2 ? obj.currentScope() : df_scopeEnv)
      obj.exitScope(decl, 2)
      ju_mergeScopeEnv(obj.currentScope(), prev_env)
      // merge exactly decl and dep from variable and current scope because scope var is absolutly fictive
      DeclAndDepObject.mergeDeclAndDep(getDeclAndDep(node), getDeclAndDep(decl), scope_name)// TODO proper exitScope and forward to node
      node.acorn_declarations.push(decl) // legacy compatibility
      node.ju_name = unionNodeNames(node.ju_name, decl.ju_name) // variable declaration node will have pipe of each of his declared name
}

export function ju_parseFunction_getName(obj, node) {
  let _name = getJuNameFromNode(obj, node, undefined, obj.litteralTreatment)
  node.ju_name = _name
}

export function ju_parseFunctionParams_init(obj, node) {
   // declared all params of the node inside of his scope
   getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], concatArrObjects(node.params, (_node) => juNodeDeclOrDep.factory(_node)))
}

export function ju_parseClass_init(obj, node, _name) {
    // declare all field of class method dans member inside
    getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)).addObjTo([_name], juNodeDeclOrDep.factory(node))
}

export function ju_parseClassElement_getName(obj, node) {
    // <=> node.ju_name = "" + this.getCurrScopeId()  + joinCharOfStaticClassElement
    if (node.static) node.ju_name += obj.getCurrScopeId() + joinCharOfStaticClassElement
}

export function ju_parseImportOrExportSpecifiers_init(obj, node, token_exportOrImport) {
  let [_name, str_num_context] = getIthContextSuffix(obj, getLabelFromTokenType(token_exportOrImport), undefined, obj.DeclAndDep[str_program])
  node.ju_name = _name
  obj.enterScope(obj.currentScope().flags, getJuNameOrName(node), false)
}

export function _getNodesFromImportOrExport(obj, node, spec, token_exportOrImport, enum_typeOfExportOrImport) {
  let [node_exported, node_local] = [spec[strEd(getLabelFromTokenType(token_exportOrImport))], spec.local]

  const getDfNodeLocalWithSource = (node, node_local, token_exportOrImport, suffix = undefined) => {
    suffix = suffix || getJuNameOrName(node_local)
    return node.source ? {...node_local, ju_name: joinNodeNameAndProperties(concatStringAndPropertyValue(getLabelFromTokenType(token_exportOrImport), resolveRelative(obj.dirpath, getJuNameOrName(node.source))), suffix)} : {...node_local}
  }

  let node_local_withSource = null
  let dep_node = null
  let node_scope = null
  switch (enum_typeOfExportOrImport) {
     case typeOfExportOrImport.all :
      node_local_withSource = getDfNodeLocalWithSource(node, node_local, token_exportOrImport, getLabelFromTokenType(tt.star))
      node_scope = node_exported
      dep_node = {...node_local, ju_name: getJuNameOrName(node_local_withSource)}
      break
    case typeOfExportOrImport.default :
      node_local_withSource = getDfNodeLocalWithSource(node, node_local, token_exportOrImport)
      /* if (getLabelFromTokenType(token_exportOrImport) === getLabelFromTokenType(tt._export)) {
        node_scope = node_local
        node_exported = {...node_local, ju_name: getLabelFromTokenType(tt._default)}
        dep_node = {...node_scope, ju_name: getLabelFromTokenType(tt._default)}
      } else { */
        node_scope = node_exported
        node_exported = {...node_scope}
        dep_node = {...node_scope, ju_name: getJuNameOrName(node_local_withSource)}
      // }
      break
    default :
      node_local_withSource = getDfNodeLocalWithSource(node, node_local, token_exportOrImport)
      if (!isNullOrUndefined(node_exported)) dep_node = getLabelFromTokenType(token_exportOrImport) === getLabelFromTokenType(tt._export) ? {...node_local} : {...node_scope, ju_name: getJuNameOrName(node_local_withSource)}
      else node_exported = node_local
      node_scope = node_exported
  }

  return [node_local_withSource, node_exported, node_scope, dep_node]
}

export function ju_parseImportOrExportSpecifier_initAndClean(obj, node, spec, token_exportOrImport, enum_typeOfExportOrImport) {
  let [node_local_withSource, node_exported, node_scope, dep_node] = _getNodesFromImportOrExport(obj, node, spec, token_exportOrImport, enum_typeOfExportOrImport)

  getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], juNodeDeclOrDep.factory(node_local_withSource))
  getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], juNodeDeclOrDep.factory(node_exported))

  obj.enterScope(obj.currentScope().flags, getJuNameOrName(node_scope), false)
  // not export without as like export {a,b,c} or export (const|let|var) a,b,c
  if (dep_node) {
    getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], juNodeDeclOrDep.factory(dep_node))
  }

  obj.exitScope(node_scope)
  return node_scope
}

export function __ju_parseImportOrExportSpecifiers_clean(obj, node, exported_node, get_node_scope, get_node_dep) {
  let node_scope = get_node_scope(exported_node)
  obj.enterScope(obj.currentScope().flags, getJuNameOrName(node_scope), false)
  getExtendedField(obj, getDependenciesName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], juNodeDeclOrDep.factory(get_node_dep(exported_node)))
  obj.exitScope(node_scope)
}
export function _ju_parseImportOrExportSpecifiers_clean(obj, node, exported_nodes, token_exportOrImport, export_name, enum_typeOfExportOrImport) {
  let get_node_dep = null
  let get_node_dep_df = (exported_node) => { return {...exported_node, ju_name: joinNodeNames(export_name, getJuNameOrName(exported_node))} }

  switch (enum_typeOfExportOrImport) {
    case typeOfExportOrImport.all :
      get_node_dep = (exported_node) => { return {...exported_node, ju_name: joinNodeNames(export_name, getLabelFromTokenType(tt.star))} }
      break
    case typeOfExportOrImport.default :
      get_node_dep = (exported_node) => { return {...exported_node, ju_name: joinNodeNames(export_name, getLabelFromTokenType(tt._default))} }
      break
    default :
    get_node_dep = get_node_dep_df
    break
  }

  let get_node_scope_df = (exported_node) => { return exported_node }
  let get_node_scope = get_node_scope_df
  if (getLabelFromTokenType(token_exportOrImport) === getLabelFromTokenType(tt._export)) switch (enum_typeOfExportOrImport) {
    case typeOfExportOrImport.default :
      get_node_scope = (exported_node) => { return {...exported_node, ju_name: getLabelFromTokenType(tt._default)} }
      break
    default :
      get_node_scope = get_node_scope_df
    break
  }

  for (const exported_node of exported_nodes) {
    __ju_parseImportOrExportSpecifiers_clean(obj, node, exported_node, get_node_scope, get_node_dep)
  }
}

export function ju_cstNode(obj, tokenInfo, _type) {
  let n_node = obj.startNodeAt(tokenInfo.start, tokenInfo.startLoc)
  n_node.ju_name = tokenInfo.value
  n_node = obj.finishNode(n_node, _type)
  return n_node
}

export function ju_currTokenInfo(obj) {
  return {start: obj.start, startLoc: obj.startLoc, value: obj.value}
}

const str_suffix = "s"
export function getPackageNameOfDeclaredVariables(_name) {
  return _name + str_suffix
}

export function getBaseNameFromPackage(_name) {
  return _name.substring(0, _name.length - str_suffix.length)
}

export function ju_parseImportOrExportSpecifiers_clean(obj, node, exported_nodes, token_exportOrImport, enum_typeOfExportOrImport) {
  if (node.source)setExtraValueFromPropsArray(node, [strArrToFieldName(str_props, getLabelFromTokenType(token_exportOrImport)), str_filepath], resolveRelative(obj.dirpath, getJuNameOrName(node.source)), undefined, setProp)

  let export_name = obj.getCurrScopeId() // assert( obj.getCurrScopeId() == `${str_export}[${i}]` == getJuNameOrName(node) )
  let prev_env = ju_getScopeEnv(obj.scopeStack.length === 2 ? obj.currentScope() : df_scopeEnv)// JU ADD
  obj.exitScope(node)
  obj.enterScope(obj.currentScope().flags, getPackageNameOfDeclaredVariables(getLabelFromTokenType(token_exportOrImport)), false)
  _ju_parseImportOrExportSpecifiers_clean(obj, node, exported_nodes, token_exportOrImport, export_name, enum_typeOfExportOrImport)
  obj.exitScope(node)// obj.df_exitScope()

  let declared_local_nodes = node.declaration && isDeclarationStatement(node.declaration.type) ? [node.declaration] : []
  for (const declared_node of declared_local_nodes) {
    obj.enterScope(obj.currentScope().flags, getJuNameOrName(declared_node), false)
    obj.exitScope(declared_node)
    getExtendedField(obj, getDeclarationsName(currDepAndDeclFieldName)).addObjTo([obj.getCurrScopeId()], juNodeDeclOrDep.factory({...node.declaration}))
  }

  let declared_imported_nodes = getLabelFromTokenType(token_exportOrImport) === getLabelFromTokenType(tt._import) ? exported_nodes : []

  _ju_parseImportOrExportSpecifiers_clean(obj, node, declared_imported_nodes, typeOfExportOrImport.unknown, export_name)
  ju_mergeScopeEnv(obj.currentScope(), prev_env)// JU ADD
}
