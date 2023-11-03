import privateClassElements from "./privateClassElement.js"

export default function privateMethods(Parser) {
  const ExtendedParser = privateClassElements(Parser)

  return class extends ExtendedParser {
    // Parse private methods
    parseClassElement(_constructorAllowsSuper) {
      const oldInClassMemberName = this._inClassMemberName
      this._inClassMemberName = true
      const result = super.parseClassElement.apply(this, arguments)
      this._inClassMemberName = oldInClassMemberName
      return result
    }

    parsePropertyName(prop, kind) {
      const isPrivate = this.options.ecmaVersion >= 8 && this._inClassMemberName && this.type === this.privateIdentifierToken && !prop.static
      this._inClassMemberName = false
      if (!isPrivate) return super.parsePropertyName(prop, kind)
      return this.parsePrivateClassElementName(prop, kind)
    }

    isClassElementNameStart() {
        return super.isClassElementNameStart() || this.type === this.privateIdentifierToken
    }
  }
}
