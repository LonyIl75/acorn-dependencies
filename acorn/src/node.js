import {Parser} from "./state.js"
import {SourceLocation} from "./locutil.js"
import {ju_finishNodeAt} from "./julien/extendsAcorn.js"
import {initExtendedFieldJuNode} from "./julien/_node.js"

const node_declsAndDeps_options = {isObject: true}

export class Node {
  constructor(parser, pos, loc) {
    this.type = ""
    this.start = pos
    this.end = 0
    if (parser.options.locations)
      this.loc = new SourceLocation(parser, loc)
    if (parser.options.directSourceFile)
      this.sourceFile = parser.options.directSourceFile
    if (parser.options.ranges)
      this.range = [pos, 0]

    initExtendedFieldJuNode(this) // JU ADD
 }
}

// Start an AST node, attaching a start offset.

const pp = Parser.prototype

pp.startNode = function() {
  return new Node(this, this.start, this.startLoc)
}

pp.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
}

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.end = pos
  if (this.options.locations)
    node.loc.end = loc
  if (this.options.ranges)
    node.range[1] = pos

  node.type = type
  ju_finishNodeAt(this, node) // JU ADD

  return node
}

pp.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
}

// Finish node at given position

pp.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
}

pp.copyNode = function(node) {
  let newNode = new Node(this, node.start, this.startLoc)
  for (let prop in node) newNode[prop] = node[prop]
  return newNode
}
