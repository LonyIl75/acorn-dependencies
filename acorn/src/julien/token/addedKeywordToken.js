    import {TokenType} from "../../tokentype.js"
    import {joinArray_with_char} from "../primitives/String.js"

    export const joinCharKeyword = "-"
    export const joinKeyword = (...args) => joinArray_with_char(args, joinCharKeyword)
    export const ju_tt = {

      ...new TokenType("await").toConcatable(),
      ...new TokenType("arrow").toConcatable(),
      ...new TokenType("async").toConcatable(),
      ...new TokenType("yield").toConcatable(),
      ...new TokenType("init").toConcatable(),
      ...new TokenType("loop").toConcatable(),
      ...new TokenType("let").toConcatable(),
      ...new TokenType("label").toConcatable(),
      ...new TokenType("for").toConcatable(),
      ...new TokenType("forIn").toConcatable(),
      ...new TokenType("forOf").toConcatable(),
      ...new TokenType("const").toConcatable(),
      ...new TokenType("from").toConcatable(),
      ...new TokenType("class").toConcatable(),
      ...new TokenType("as").toConcatable(),
      ...new TokenType("var").toConcatable(),
      ...new TokenType("of").toConcatable(),
      ...new TokenType("function").toConcatable(),
      ...new TokenType("method").toConcatable(),
      ...new TokenType("set").toConcatable(),
      ...new TokenType("get").toConcatable(),
      ...new TokenType("static").toConcatable(),
      ...new TokenType("constructor").toConcatable(),

      ...new TokenType("while").toConcatable(),
      ...new TokenType("with").toConcatable(),
      ...new TokenType("break").toConcatable(),
      ...new TokenType("case").toConcatable(),
      ...new TokenType("catch").toConcatable(),
      ...new TokenType("continue").toConcatable(),
      ...new TokenType("do").toConcatable(),
      ...new TokenType("else").toConcatable(),
      ...new TokenType("finally").toConcatable(),
      ...new TokenType("if").toConcatable(),
      ...new TokenType("return").toConcatable(),
      ...new TokenType("switch").toConcatable(),
      ...new TokenType("throw").toConcatable(),
      ...new TokenType("try").toConcatable(),
      ...new TokenType("default").toConcatable(),
      ...new TokenType("delete").toConcatable(),
      ...new TokenType("export").toConcatable(),
      ...new TokenType("import").toConcatable(),

      ...new TokenType("extends").toConcatable(),
      /* ...new TokenType("implements").toConcatable(),
      ...new TokenType("interface").toConcatable(),
      ...new TokenType("package").toConcatable(),
      ...new TokenType("private").toConcatable(),
      ...new TokenType("protected").toConcatable(),
      ...new TokenType("public").toConcatable(), */

      ...new TokenType("null").toConcatable(),
      ...new TokenType("undefined").toConcatable(),
      ...new TokenType("true").toConcatable(),
      ...new TokenType("false").toConcatable(),
      ...new TokenType("in").toConcatable(),
      ...new TokenType("instanceof").toConcatable(),
      ...new TokenType("typeof").toConcatable(),
      ...new TokenType("void").toConcatable(),

      ...new TokenType("enum").toConcatable(),

      ...new TokenType("super").toConcatable(),
      ...new TokenType("this").toConcatable(),
      ...new TokenType("new").toConcatable(),
      ...new TokenType("", {}, "empty").toConcatable()
    }
