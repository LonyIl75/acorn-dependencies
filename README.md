# My extension of Acorn

In the context of __Komorebi__ project, I have used acorn to detect dependencies in javascript code. 
(see : [#17905249](https://stackoverflow.com/questions/17905249/how-can-i-detect-all-dependencies-of-a-function-in-node-js) )

[acorn-version](https://github.com/acornjs/acorn/tree/7fb1ee766f4169eed10ae6db4db7ddbdd54a598a): last commit 7fb1ee7 Sep 4, 2023

| WARNING: This code is currently a WIP. |
| --- |

## Example : 

(see [test-example.js](https://github.com/LonyIl75/acorn-dependencies/blob/main/test/julien/test-example.js))
```javascript 
let _obj_import = {[str_dependencies]:juNodeDeclOrDep.factoryFromProps({ju_name:function_name}),...juNodeDeclOrDep.factoryFromProps({ju_name: concatStringAndPropertyValue(str_import,path_code)}),[str_props_import]:{[str_filepath]:path_code}}

let r_fileContent = await getDepsOfImportedFile({[path_code] :_obj_import})

console.log(r_fileContent.reduce((_str,elm)=> _str + elm,""))
```
__To build an "imported node"__ :

First we specify all the functions that we want to import :
```
{[str_dependencies]:juNodeDeclOrDep.factoryFromProps({ju_name:function_name})}
```
Then we specify the path of the file in wich these functions reside :
```javascript
{[str_props_import]:{[str_filepath]:path_code}}
```
Finally we specify the value of this node :

```javascript
juNodeDeclOrDep.factoryFromProps({ju_name: concatStringAndPropertyValue(str_import,path_code)})
```

__To retrieve the content of the file that resolves all subdependencies of this 'imported node':__ : 
```javascript
let r_fileContent = await getDepsOfImportedFile({[path_code] :_obj_import})
```
