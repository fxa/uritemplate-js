/*jshint browser:true, bitwise:true, curly:true, devel: true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, undef:true */
/*global module */


(function (exportCallback) {
    "use strict";

    //
    // helpers
    //
    function isArray(value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    }

    // performs an array.reduce for objects
    function objectReduce(object, callback, initialValue) {
        var
            propertyName,
            currentValue = initialValue;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                currentValue = callback(currentValue, object[propertyName], propertyName, object);
            }
        }
        return currentValue;
    }

    // performs an array.reduce, if reduce is not present (older browser...)
    function arrayReduce(array, callback, initialValue) {
        var
            index,
            currentValue = initialValue;
        for (index = 0; index < array.length; index += 1) {
            currentValue = callback(currentValue, array[index], index, array);
        }
        return currentValue;
    }

    function reduce(arrayOrObject, callback, initialValue) {
        return (isArray(arrayOrObject)) ? arrayReduce(arrayOrObject, callback, initialValue) : objectReduce(arrayOrObject, callback, initialValue);
    }

    /**
     * Detects, whether a given element is defined in the sense of rfc 6570
     * Section 2.3 of the RFC makes clear defintions:
     * * undefined and null are not defined.
     * * the empty string is defined
     * * an array is defined, if it contains at least one defined element
     * * an object is defined, if it contains at least one defined property
     * @param object
     * @return {Boolean}
     */
    function isDefined (object) {
        var
            index,
            propertyName;
        if (object === null || object === undefined) {
            return false;
        }
        if (isArray(object)) {
            for (index = 0; index < object.length; index +=1) {
                if(isDefined(object[index])) {
                    return true;
                }
            }
            return false;
        }
        if (typeof object === "string") {
            // the empty string is considered as defined
            return true;
        }
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                if(isDefined(object[propertyName])) {
                    return true;
                }
            }
        }
        return false;
    }

    function isAlpha(chr) {
        return (chr >= 'a' && chr <= 'z') || ((chr >= 'A' && chr <= 'Z'));
    }

    function isDigit(chr) {
        return (chr >= '0' && chr <= '9');
    }

    function isHexDigit(chr) {
        return isDigit(chr) || (chr >= 'a' && chr <= 'f') || (chr >= 'A' && chr <= 'F');
    }

    function isPctEncoded(chr) {
        return chr.length === 3 && chr.charAt(0) === '%' && isHexDigit(chr.charAt(1) && isHexDigit(chr.charAt(2)));
    }

    /**
     * Returns if an character is an varchar character according 2.3 of rfc 6570
     * @param chr
     * @return (Boolean)
     */
    function isVarchar(chr) {
        return isAlpha(chr) || isDigit(chr) || chr === '_' || isPctEncoded(chr);
    }

    /**
     * Returns if chr is an unreserved character according 1.5 of rfc 6570
     * @param chr
     * @return {Boolean}
     */
    function isUnreserved(chr) {
        return isAlpha(chr) || isDigit(chr) || chr === '-' || chr === '.' || chr === '_' || chr === '~';
    }

    /**
     * Returns if chr is an reserved character according 1.5 of rfc 6570
     * @param chr
     * @return {Boolean}
     */
    function isReserved(chr) {
        return chr === ':' || chr === '/' || chr === '?' || chr === '#' || chr === '[' || chr === ']' || chr === '@' || chr === '!' || chr === '$' || chr === '&' || chr === '(' ||
            chr === ')' || chr === '*' || chr === '+' || chr === ',' || chr === ';' || chr === '=' || chr === "'";
    }

    function pctEncode(chr) {
        return '%' + chr.charCodeAt(0).toString(16).toUpperCase();
    }

    function encode(text, passReserved) {
        var
            result = '',
            index,
            chr;
        for (index = 0; index < text.length; index += 1) {
            chr = text.charAt(index);
            if (chr === '%') {
                if (isHexDigit(text.charAt(index+1)) && isHexDigit(text.charAt(index+2))) {
                    // pass three chars to the result
                    result += text.substr(index, 3);
                    index += 2;
                }else {
                    result += '%25';
                }
            }
            else if (isUnreserved(chr) || (passReserved && isReserved(chr))) {
                result += chr;
            }
            else {
                result += pctEncode(chr);
            }
        }
        return result;
    }

    function encodePassReserved (text) {
        return encode(text, true);
    }

    function Operator(symbol, encode) {
        this.symbol = symbol;
        this.encode = encode;
    }

    Operator.prototype.separator = function () {
        return (this.symbol === '?') ? '&' : (this.symbol === '' || this.symbol === '+' || this.symbol === '#') ? ',' : this.symbol;
    };

    Operator.prototype.named = function () {
        return this.symbol === ';' || this.symbol === '&' || this.symbol === '?';
    };

    Operator.prototype.ifEmpty = function () {
        return (this.symbol === '&' || this.symbol === '?') ? '=' : '';
    };

    Operator.prototype.first = function () {
        return (this.symbol === '+' ) ? '' : this.symbol;
    };

    Operator.bySymbol = {
        '': new Operator('', encode),
        '+': new Operator('+', encodePassReserved),
        '#': new Operator('#', encodePassReserved),
        '.': new Operator('.', encode),
        '/': new Operator('/', encode),
        ';': new Operator(';', encode),
        '?': new Operator('?', encode),
        '&': new Operator('&', encode)
    };

    Operator.valueOf = function (chr) {
        if (Operator.bySymbol[chr]) {
            return Operator.bySymbol[chr];
        }
        if ("=,!@|".indexOf(chr) >= 0) {
            throw new Error('Illegal use of reserved operator "' + chr + '"');
        }
        return Operator.bySymbol[''];
    };

    var
        UriTemplate;

    UriTemplate = function (templateText, expressions) {
        this.templateText = templateText;
        this.experssions = expressions;
    };

    UriTemplate.prototype.toString = function () {
        return this.templateText;
    };

    UriTemplate.prototype.expand = function (variables) {
        var
            index,
            result = '';
        for (index = 0; index < this.experssions.length; index += 1) {
            result += this.experssions[index].expand(variables);
        }
        return result;
    };

    function encodeLiteral(literal) {
        var
            result = '',
            index,
            chr;
        for (index = 0; index < literal.length; index += 1) {
            chr = literal.charAt(index);
            if (chr === '%') {
                if (isHexDigit(literal.charAt(index + 1)) && isHexDigit(literal.charAt(index + 2))) {
                    result += literal.substr(index, 3);
                    index += 2;
                }
                else {
                    throw new Error('illegal % found at position ' + index);
                }
            }
            else {
                if (isReserved(chr) || isUnreserved(chr)) {
                    result += chr;
                }
                else {
                    result += pctEncode(chr);
                }
            }
        }
        return result;
    }

    function LiteralExpression(literal) {
        this.literal = encodeLiteral(literal);
    }

    LiteralExpression.prototype.expand = function () {
        return this.literal;
    };

    LiteralExpression.prototype.toString = LiteralExpression.prototype.expand;

    function VariableExpression(templateText, operator, varspecs) {
        this.templateText = templateText;
        this.operator = operator;
        this.varspecs = varspecs;
    }

    VariableExpression.prototype.toString = function () {
        return this.templateText;
    };

    // makes numbers an booleans to strings (Date will follow...)
    function normalizeValue(value) {
        return (typeof value === 'number' || typeof value === 'boolean') ? value.toString() : value;
    }
    
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
                result += operator.encode(normalizeValue(currentValue));
            }
            return result;
        }

        function reduceNamedExploded(result, currentValue, currentKey) {
            if (isDefined(currentValue)) {
                if (result.length > 0) {
                    result += operator.separator();
                }
                result += (valueIsArr) ? operator.encode(varspec.varname) : operator.encode(currentKey);
                result += '=' + operator.encode(normalizeValue(currentValue));
            }
            return result;
        }

        function reduceUnnamedExploded(result, currentValue, currentKey) {
            if (isDefined(currentValue)) {
                if (result.length > 0) {
                    result += operator.separator();
                }
                if (!valueIsArr) {
                    result += operator.encode(currentKey) + '=';
                }
                result += operator.encode(normalizeValue(currentValue));
            }
            return result;
        }

        // expand each varspec and join with operator's separator
        for (index = 0; index < this.varspecs.length; index += 1) {
            varspec = this.varspecs[index];
            value = normalizeValue(variables[varspec.varname]);
            if (!isDefined(value)) {
                continue;
            }
            if (isFirstVarspec)  {
                result += this.operator.first();
                isFirstVarspec = false;
            }
            else {
                result += this.operator.separator();
            }
            valueIsArr = isArray(value);
            if (typeof value === 'string') {
                if (this.operator.named()) {
                    result += varspec.varname;
                    if (value === '') {
                        result += this.operator.ifEmpty();
                        // "and skip to the next varspec" (appendix A of the rfc)
                        continue;
                    }
                    else {
                        result += '=';
                    }
                }
                if (varspec.maxLength && value.length > varspec.maxLength) {
                    value = value.substr(0, varspec.maxLength);
                }
                result += this.operator.encode(value);
            }
            else if (varspec.maxLength) {
                // 2.4.1 of the spec says: "Prefix modifiers are not applicable to variables that have composite values."
                throw new Error('Prefix modifiers are not applicable to variables that have composite values. You tried to expand ' + this + " with " + JSON.stringify(value));
            }
            else if (!varspec.exploded) {
                if (operator.named()) {
                    result += varspec.varname;
                    if (!isDefined(value)) {
                        result += this.operator.ifEmpty();
                        // "and skip to the next varspec" (appendix a of the rfc
                        continue;
                    }
                    else {
                        result += '=';
                    }
                }
                result += reduce(value, reduceUnexploded, '');
            }
            else {
                // exploded and not string
                result += reduce(value, operator.named() ? reduceNamedExploded : reduceUnnamedExploded, '');
            }
        }
        return result;
    };

    function parseExpression(outerText) {
        var
            text,
            operator,
            varspecs = [],
            varspec = null,
            varnameStart = null,
            maxLengthStart = null,
            index,
            chr = ' ';

        function closeVarname() {
            varspec = {varname: text.substring(varnameStart, index), exploded: false, maxLength: null};
            varnameStart = null;
        }

        function closeMaxLength() {
            if (maxLengthStart === index) {
                throw new Error("after a ':' you have to specify the length. position = " + index);
            }
            varspec.maxLength = parseInt(text.substring(maxLengthStart, index), 10);
            maxLengthStart = null;
        }
        text = outerText.substr(1, outerText.length - 2);
        for (index = 0; index < text.length; index += chr.length) {
            chr = text[index];
            if (index === 0) {
                operator = Operator.valueOf(chr);
                if (operator.symbol !== '') {
                    // first char is operator symbol. so we can continue
                    varnameStart = 1;
                    continue;
                }
                // the first char was a regular varname char. We have simple strings and must go on.
                varnameStart = 0;
            }
            if (varnameStart !== null) {
                // Within varnames pct encoded values are allowed. looks strange to me.
                if (chr === '%') {
                    if (index > text.length - 2 || !isDigit(text[index + 1] || !isDigit(text[index + 2]))) {
                        throw new Error('illegal char "%" at position ' + index);
                    }
                    chr += text[index + 1] + text[index + 2];
                }
                // the spec says: varname       =  varchar *( ["."] varchar )
                // so a dot is allowed except for the first char
                if (chr === '.') {
                    if (varnameStart === index) {
                        throw new Error('a varname MUST NOT start with a dot -- see position ' + index);
                    }
                    continue;
                }
                if (isVarchar(chr)) {
                    continue;
                }
                closeVarname();
            }
            if (maxLengthStart !== null) {
                if (isDigit(chr)) {
                    continue;
                }
                closeMaxLength();
            }
            if (chr === ':') {
                if (varspec.maxLength !== null) {
                    throw new Error('only one :maxLength is allowed per varspec at position ' + index);
                }
                maxLengthStart = index + 1;
                continue;
            }
            if (chr === '*') {
                if (varspec === null) {
                    throw new Error('explode exploded at position ' + index);
                }
                if (varspec.exploded) {
                    throw new Error('explode exploded twice at position ' + index);
                }
                if (varspec.maxLength) {
                    throw new Error('an explode (*) MUST NOT follow to a prefix, see position ' + index);
                }
                varspec.exploded = true;
                continue;
            }
            // the only legal character now is the comma
            if (chr === ',') {
                varspecs.push(varspec);
                varspec = null;
                varnameStart = index + 1;
                continue;
            }
            throw new Error("illegal character '" + chr + "' at position " + index);
        } // for chr
        if (varnameStart !== null) {
            closeVarname();
        }
        if (maxLengthStart !== null) {
            closeMaxLength();
        }
        varspecs.push(varspec);
        return new VariableExpression(outerText, operator, varspecs);
    }

    UriTemplate.parse = function parse(uriTemplateText) {
        // assert filled string
        var
            index,
            chr,
            expressions = [],
            braceOpenIndex = null,
            literalStart = 0;

        for (index = 0; index < uriTemplateText.length; index += 1) {
            chr = uriTemplateText.charAt(index);
            if (literalStart !== null) {
                if (chr === '}') {
                    throw new Error('brace was closed in position ' + index + " but never opened");
                }
                if (chr === '{') {
                    if (literalStart < index) {
                        expressions.push(new LiteralExpression(uriTemplateText.substring(literalStart, index)));
                    }
                    literalStart = null;
                    braceOpenIndex = index;
                }
                // TODO check for allowed chars. This if-statement is just to pass the uritemplate-test
                if (chr === ':' && uriTemplateText.substring(literalStart, index).indexOf('/') >= 0) {
                    throw new Error('":" not allowed after a "/" in a regular uri');
                }
                continue;
            }

            if (braceOpenIndex !== null) {
                // here just { is forbidden
                if (chr === '{') {
                    throw new Error('brace was opened in position ' + braceOpenIndex + " and cannot be reopened in position " + index);
                }
                if (chr === '}') {
                    if (braceOpenIndex + 1 === index) {
                        throw new Error("empty braces on position " + braceOpenIndex);
                    }
                    expressions.push(parseExpression(uriTemplateText.substring(braceOpenIndex, index + 1)));
                    braceOpenIndex = null;
                    literalStart = index + 1;
                }
                continue;
            }
            throw new Error('reached unreachable code');
        }
        if (braceOpenIndex !== null) {
            throw new Error("brace was opened on position " + braceOpenIndex + ", but never closed");
        }
        if (literalStart < uriTemplateText.length) {
            expressions.push(new LiteralExpression(uriTemplateText.substr(literalStart)));
        }
        return new UriTemplate(uriTemplateText, expressions);
    };

    exportCallback(UriTemplate);

}(function (UriTemplate) {
        "use strict";
        // export UriTemplate, when module is present, or pass it to window or global
        if (typeof(module) !== "undefined") {
            module.exports = UriTemplate;
        }
        else if (typeof(window) !== "undefined") {
            window.UriTemplate = UriTemplate;
        }
        else {
            global.UriTemplate = UriTemplate;
        }
    }
));

