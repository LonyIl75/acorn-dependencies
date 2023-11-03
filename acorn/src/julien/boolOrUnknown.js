export let boolOrUnknown = {};
(function(boolOrUnknown) {
    let enum_value;
    (function(enum_value) {
        enum_value[enum_value.true = 1] = "true"
        enum_value[enum_value.false = 0] = "false"
        enum_value[enum_value.unknown = -1] = "unknown"
    })(enum_value = boolOrUnknown.enum_value || (boolOrUnknown.enum_value = {}))
    boolOrUnknown.isFalseOrUnknown = function(param) {
        return param === enum_value.false || param === enum_value.unknown
    }
    boolOrUnknown.retEnumTrueIfUnknownElseSelf = function(param) {
        return param === enum_value.unknown ? true : param
    }
    boolOrUnknown.getUnSettedValue = function() {
        return enum_value.unknown
    }
    boolOrUnknown.retEnumFalseIfUnknownElseSelf = function(param, paramSetted) {
        return param === enum_value.unknown ? enum_value.false : param
    }
    boolOrUnknown.isTrue = function(param) {
        return param === enum_value.true
    }
    boolOrUnknown.isUnknown = function(param) {
        return param === enum_value.unknown
    }
    boolOrUnknown.and = function(param1, param2) {
        return param1 === enum_value.true ? param2 === enum_value.true ? enum_value.true : param2 : param1
    }
    boolOrUnknown.getTrue = function() {
        return enum_value.true
    }
    boolOrUnknown.getFalse = function() {
        return enum_value.false
    }
})(boolOrUnknown)
