import {TokenType, startsExpr, beforeExpr, binop, kw, getLabelFromTokenType, getTypeFromTokenType, getKeywordId} from "./tokentype.js"
import {description_tokens} from "./julien/token/configToken.js"

export const types = {
    ...kw(getLabelFromTokenType(description_tokens.ProgramStatement), {}, getKeywordId("root")).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.EmptyStatement), {}, getKeywordId(getTypeFromTokenType(description_tokens.EmptyStatement))).toConcatable(), // for example

    ...new TokenType("num", startsExpr).toConcatable(),
    ...new TokenType("regexp", startsExpr).toConcatable(),
    ...new TokenType("string", startsExpr).toConcatable(),
    ...new TokenType("name", startsExpr).toConcatable(),
    ...new TokenType("privateId", startsExpr).toConcatable(),
    ...new TokenType("eof").toConcatable(),

    // Punctuation token types.
    ...new TokenType("[", {beforeExpr: true, startsExpr: true}, "bracketL").toConcatable(),
    ...new TokenType("]", {}, "bracketR").toConcatable(),
    ...new TokenType("{", {beforeExpr: true, startsExpr: true}, "braceL").toConcatable(),
    ...new TokenType("}", {}, "braceR").toConcatable(),
    ...new TokenType("(", {beforeExpr: true, startsExpr: true}, "parenL").toConcatable(),
    ...new TokenType(")", {}, "parenR").toConcatable(),
    ...new TokenType(",", beforeExpr, "comma").toConcatable(),
    ...new TokenType(";", beforeExpr, "semi").toConcatable(),
    ...new TokenType(":", beforeExpr, "colon").toConcatable(),
    ...new TokenType(".", {}, "dot").toConcatable(),
    ...new TokenType("?", beforeExpr, "question").toConcatable(),
    ...new TokenType("?.", {}, "questionDot").toConcatable(),
    ...new TokenType("=>", beforeExpr, "arrow").toConcatable(),
    ...new TokenType("template", {}).toConcatable(),
    ...new TokenType("invalidTemplate").toConcatable(),
    ...new TokenType("...", beforeExpr, "ellipsis").toConcatable(),
    ...new TokenType("`", startsExpr, "backQuote").toConcatable(),
    ...new TokenType("${", {beforeExpr: true, startsExpr: true}, "dollarBraceL").toConcatable(),

    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.

    ...new TokenType("=", {beforeExpr: true, isAssign: true}, "eq").toConcatable(),
    ...new TokenType("_=", {beforeExpr: true, isAssign: true}, "assign").toConcatable(),
    ...new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}, "incDec").toConcatable(),
    ...new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}, "prefix").toConcatable(),

    ...binop("||", 1, "logicalOR").toConcatable(),
    ...binop("&&", 2, "logicalAND").toConcatable(),
    ...binop("|", 3, "bitwiseOR").toConcatable(),
    ...binop("^", 4, "bitwiseXOR").toConcatable(),
    ...binop("&", 5, "bitwiseAND").toConcatable(),
    ...binop("==/!=/===/!==", 6, "equality").toConcatable(),
    ...binop("</>/<=/>=", 7, "relational").toConcatable(),
    ...binop("<</>>/>>>", 8, "bitShift").toConcatable(),
    ...new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}, "plusMin").toConcatable(),
    ...binop("%", 10, "modulo").toConcatable(),
    ...binop("*", 10, "star").toConcatable(),
    ...binop("/", 10, "slash").toConcatable(),
    ...new TokenType("**", {beforeExpr: true}, "starstar").toConcatable(),
    ...binop("??", 1, "coalesce").toConcatable(),

    // Keyword token types.
    ...kw(getLabelFromTokenType(description_tokens.BreakStatement)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.SwitchCase), beforeExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.CatchClause)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ContinueStatement)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.DebuggerStatement)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.DefaultClause), beforeExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.DoWhileStatement), {isLoop: true, beforeExpr: true}).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ElseClause), beforeExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.FinallyClause)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ForStatement), {isLoop: true}).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.FunctionDeclaration), startsExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.IfStatement)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ReturnStatement), beforeExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.SwitchStatement)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ThrowStatement), beforeExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.TryStatement)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.VariableDeclaration)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ConstantVariableDeclaration)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.WhileStatement), {isLoop: true}).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.WithStatement)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.NewExpressionStatement), {beforeExpr: true, startsExpr: true}).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ThisExpressionStatement), startsExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.Super), startsExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ClassDeclaration), startsExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.Extends), beforeExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ExportStatement)).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.ImportDeclaration), startsExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.Null), startsExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.Undefined), startsExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.True), startsExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.False), startsExpr).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.In), {beforeExpr: true, binop: 7}).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.Instanceof), {beforeExpr: true, binop: 7}).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.Typeof), {beforeExpr: true, prefix: true, startsExpr: true}).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.Void), {beforeExpr: true, prefix: true, startsExpr: true}).toConcatable(),
    ...kw(getLabelFromTokenType(description_tokens.Delete), {beforeExpr: true, prefix: true, startsExpr: true}).toConcatable()

  }
