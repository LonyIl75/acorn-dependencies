# Acorn

[![Build Status](https://github.com/acornjs/acorn/workflows/ci/badge.svg)](https://github.com/acornjs/acorn/actions)
[![NPM version](https://img.shields.io/npm/v/acorn.svg)](https://www.npmjs.com/package/acorn)
[![CDNJS](https://img.shields.io/cdnjs/v/acorn.svg)](https://cdnjs.com/libraries/acorn)  

A tiny, fast JavaScript parser, written completely in JavaScript.

## Community

<a href="https://stand-with-ukraine.pp.ua/"><img src="https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct.svg" width="800"></a>

Acorn is open source software released under an
[MIT license](https://github.com/acornjs/acorn/blob/master/acorn/LICENSE).

You are welcome to
[report bugs](https://github.com/acornjs/acorn/issues) or create pull
requests on [github](https://github.com/acornjs/acorn). For questions
and discussion, please use the
[Tern discussion forum](https://discuss.ternjs.net).

## Packages

This repository holds three packages:

 - [acorn](https://github.com/acornjs/acorn/tree/master/acorn/): The
   main parser
 - [acorn-loose](https://github.com/acornjs/acorn/tree/master/acorn-loose/): The
   error-tolerant parser
 - [acorn-walk](https://github.com/acornjs/acorn/tree/master/acorn-walk/): The
   syntax tree walker

To build the content of the repository, run `npm install`.

```sh
git clone https://github.com/acornjs/acorn.git
cd acorn
npm install
```

## Plugin developments

Acorn is designed to support plugins which can, within reasonable
bounds, redefine the way the parser works. Plugins can add new token
types and new tokenizer contexts (if necessary), and extend methods in
the parser object. This is not a clean, elegant API—using it requires
an understanding of Acorn's internals, and plugins are likely to break
whenever those internals are significantly changed. But still, it is
_possible_, in this way, to create parsers for JavaScript dialects
without forking all of Acorn. And in principle it is even possible to
combine such plugins, so that if you have, for example, a plugin for
parsing types and a plugin for parsing JSX-style XML literals, you
could load them both and parse code with both JSX tags and types.

A plugin is a function from a parser class to an extended parser
class. Plugins can be used by simply applying them to the `Parser`
class (or a version of that already extended by another plugin). But
because that gets a little awkward, syntactically, when you are using
multiple plugins, the static method `Parser.extend` can be called with
any number of plugin values as arguments to create a `Parser` class
extended by all those plugins. You'll usually want to create such an
extended class only once, and then repeatedly call `parse` on it, to
avoid needlessly confusing the JavaScript engine's optimizer.

```javascript
const {Parser} = require("acorn")

const MyParser = Parser.extend(
  require("acorn-jsx")(),
  require("acorn-bigint")
)
console.log(MyParser.parse("// Some bigint + JSX code"))
```

Plugins override methods in their new parser class to implement
additional functionality. It is recommended for a plugin package to
export its plugin function as its default value or, if it takes
configuration parameters, to export a constructor function that
creates the plugin function.

This is what a trivial plugin, which adds a bit of code to the
`readToken` method, might look like:

```javascript
module.exports = function noisyReadToken(Parser) {
  return class extends Parser {
    readToken(code) {
      console.log("Reading a token!")
      super.readToken(code)
    }
  }
}
```

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
