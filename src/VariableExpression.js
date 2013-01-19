/*jshint unused:false */
/*global pctEncoder, rfcCharHelper, isDefined, LiteralExpression, objectHelper*/
var VariableExpression = (function () {
    "use strict";

    // helper function if JSON is not available
    function prettyPrint(value) {
        return JSON ? JSON.stringify(value) : value;
    }

    function VariableExpression(templateText, operator, varspecs) {
        this.templateText = templateText;
        this.operator = operator;
        this.varspecs = varspecs;
    }

    VariableExpression.prototype.toString = function () {
        return this.templateText;
    };

    VariableExpression.prototype.expand = function expandExpression(variables) {
        var
            result = '',
            index,
            varspec,
            value,
            valueIsArr,
            isFirstVarspec = true,
            operator = this.operator;

        // callback to be used within array.reduce
        function reduceUnexploded(result, currentValue, currentKey) {
            if (isDefined(currentValue)) {
                if (result.length > 0) {
                    result += ',';
                }
                if (!valueIsArr) {
                    result += operator.encode(currentKey) + ',';
                }
                result += operator.encode(currentValue);
            }
            return result;
        }

        function reduceNamedExploded(result, currentValue, currentKey) {
            if (isDefined(currentValue)) {
                if (result.length > 0) {
                    result += operator.separator;
                }
                result += (valueIsArr) ? LiteralExpression.encodeLiteral(varspec.varname) : operator.encode(currentKey);
                result += '=' + operator.encode(currentValue);
            }
            return result;
        }

        function reduceUnnamedExploded(result, currentValue, currentKey) {
            if (isDefined(currentValue)) {
                if (result.length > 0) {
                    result += operator.separator;
                }
                if (!valueIsArr) {
                    result += operator.encode(currentKey) + '=';
                }
                result += operator.encode(currentValue);
            }
            return result;
        }

        // expand each varspec and join with operator's separator
        for (index = 0; index < this.varspecs.length; index += 1) {
            varspec = this.varspecs[index];
            value = variables[varspec.varname];
            if (!isDefined(value)) {
                 continue;
            }
            if (isFirstVarspec) {
                result += this.operator.first;
                isFirstVarspec = false;
            }
            else {
                result += this.operator.separator;
            }
            valueIsArr = objectHelper.isArray(value);
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                value = value.toString();
                if (this.operator.named) {
                    result += LiteralExpression.encodeLiteral(varspec.varname);
                    if (value === '') {
                        result += this.operator.ifEmpty;
                        continue;
                    }
                    result += '=';
                }
                if (varspec.maxLength && value.length > varspec.maxLength) {
                    value = value.substr(0, varspec.maxLength);
                }
                result += this.operator.encode(value);
            }
            else if (varspec.maxLength) {
                // 2.4.1 of the spec says: "Prefix modifiers are not applicable to variables that have composite values."
                throw new Error('Prefix modifiers are not applicable to variables that have composite values. You tried to expand ' + this + " with " + prettyPrint(value));
            }
            else if (!varspec.exploded) {
                if (operator.named) {
                    result += LiteralExpression.encodeLiteral(varspec.varname);
                    if (!isDefined(value)) {
                        result += this.operator.ifEmpty;
                        continue;
                    }
                    result += '=';
                }
                result += objectHelper.reduce(value, reduceUnexploded, '');
            }
            else {
                // exploded and not string
                result += objectHelper.reduce(value, operator.named ? reduceNamedExploded : reduceUnnamedExploded, '');
            }
        }
        return result;
    };


    return VariableExpression;
}());
