/*jshint */
/*global unescape, module, define, window, global*/

/*
 UriTemplate Copyright (c) 2012-2013 Franz Antesberger. All Rights Reserved.
 Available via the MIT license.
*/

(function (exportCallback) {
    "use strict";
var objectHelper = (function () {
    function isArray (value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    }

    // performs an array.reduce for objects
    // TODO handling if initialValue is undefined
    function objectReduce (object, callback, initialValue) {
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
    // TODO handling if initialValue is undefined
    function arrayReduce (array, callback, initialValue) {
        var
            index,
            currentValue = initialValue;
        for (index = 0; index < array.length; index += 1) {
            currentValue = callback(currentValue, array[index], index, array);
        }
        return currentValue;
    }

    function reduce (arrayOrObject, callback, initialValue) {
        return isArray(arrayOrObject) ? arrayReduce(arrayOrObject, callback, initialValue) : objectReduce(arrayOrObject, callback, initialValue);
    }

    function deepFreezeUsingObjectFreeze (object) {
        if (typeof object !== "object" || object === null) {
            return object;
        }
        Object.freeze(object);
        var property, propertyName;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                property = object[propertyName];
                // be aware, arrays are 'object', too
                if (typeof property === "object") {
                    deepFreeze(property);
                }
            }
        }
        return object;
    }

    function deepFreeze (object) {
        if (typeof Object.freeze === 'function') {
            return deepFreezeUsingObjectFreeze(object);
        }
        return object;
    }


    return {
        isArray: isArray,
        reduce: reduce,
        deepFreeze: deepFreeze
    };
}());

var charHelper = (function () {

    function isAlpha(chr) {
        return (chr >= 'a' && chr <= 'z') || ((chr >= 'A' && chr <= 'Z'));
    }

    function isDigit(chr) {
        return chr >= '0' && chr <= '9';
    }

    function isHexDigit(chr) {
        return isDigit(chr) || (chr >= 'a' && chr <= 'f') || (chr >= 'A' && chr <= 'F');
    }

    return {
        isAlpha: isAlpha,
        isDigit: isDigit,
        isHexDigit: isHexDigit
    };
}());

var pctEncoder = (function () {
    var utf8 = {
        encode: function (chr) {
            // see http://ecmanaut.blogspot.de/2006/07/encoding-decoding-utf8-in-javascript.html
            return unescape(encodeURIComponent(chr));
        },
        numBytes: function (firstCharCode) {
            if (firstCharCode <= 0x7F) {
                return 1;
            }
            else if (0xC2 <= firstCharCode && firstCharCode <= 0xDF) {
                return 2;
            }
            else if (0xE0 <= firstCharCode && firstCharCode <= 0xEF) {
                return 3;
            }
            else if (0xF0 <= firstCharCode && firstCharCode <= 0xF4) {
                return 4;
            }
            // no valid first octet
            return 0;
        },
        isValidFollowingCharCode: function (charCode) {
            return 0x80 <= charCode && charCode <= 0xBF;
        }
    };

    /**
     * encodes a character, if needed or not.
     * @param chr
     * @return pct-encoded character
     */
    function encodeCharacter (chr) {
        var
            result = '',
            octets = utf8.encode(chr),
            octet,
            index;
        for (index = 0; index < octets.length; index += 1) {
            octet = octets.charCodeAt(index);
            result += '%' + octet.toString(16).toUpperCase();
        }
        return result;
    }

    /**
     * Returns, whether the given text at start is in the form 'percent hex-digit hex-digit', like '%3F'
     * @param text
     * @param start
     * @return {boolean|*|*}
     */
    function isPercentDigitDigit (text, start) {
        return text[start] === '%' && charHelper.isHexDigit(text[start + 1]) && charHelper.isHexDigit(text[start + 2]);
    }

    /**
     * Parses a hex number from start with length 2.
     * @param text a string
     * @param start the start index of the 2-digit hex number
     * @return {Number}
     */
    function parseHex2 (text, start) {
        return parseInt(text.substr(start, 2), 16);
    }

    /**
     * Returns whether or not the given char sequence is a correctly pct-encoded sequence.
     * @param chr
     * @return {boolean}
     */
    function isPctEncoded (chr) {
        if (!isPercentDigitDigit(chr, 0)) {
            return false;
        }
        var firstCharCode = parseHex2(chr, 1);
        var numBytes = utf8.numBytes(firstCharCode);
        if (numBytes === 0) {
            return false;
        }
        for (var byteNumber = 1; byteNumber < numBytes; byteNumber += 1) {
            if (!isPercentDigitDigit(chr, 3*byteNumber) || !utf8.isValidFollowingCharCode(parseHex2(chr, 3*byteNumber + 1))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Reads as much as needed from the text, e.g. '%20' or '%C3%B6'. It does not decode!
     * @param text
     * @param startIndex
     * @return the character or pct-string of the text at startIndex
     */
    function pctCharAt(text, startIndex) {
        var chr = text[startIndex];
        if (!isPercentDigitDigit(text, startIndex)) {
            return chr;
        }
        var utf8CharCode = parseHex2(text, startIndex + 1);
        var numBytes = utf8.numBytes(utf8CharCode);
        if (numBytes === 0) {
            return chr;
        }
        for (var byteNumber = 1; byteNumber < numBytes; byteNumber += 1) {
            if (!isPercentDigitDigit(text, startIndex + 3 * byteNumber) || !utf8.isValidFollowingCharCode(parseHex2(text, startIndex + 3 * byteNumber + 1))) {
                return chr;
            }
        }
        return text.substr(startIndex, 3 * numBytes);
    }

    return {
        encodeCharacter: encodeCharacter,
        isPctEncoded: isPctEncoded,
        pctCharAt: pctCharAt
    };
}());

var rfcCharHelper = (function () {

    /**
     * Returns if an character is an varchar character according 2.3 of rfc 6570
     * @param chr
     * @return (Boolean)
     */
    function isVarchar (chr) {
        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === '_' || pctEncoder.isPctEncoded(chr);
    }

    /**
     * Returns if chr is an unreserved character according 1.5 of rfc 6570
     * @param chr
     * @return {Boolean}
     */
    function isUnreserved (chr) {
        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === '-' || chr === '.' || chr === '_' || chr === '~';
    }

    /**
     * Returns if chr is an reserved character according 1.5 of rfc 6570
     * or the percent character mentioned in 3.2.1.
     * @param chr
     * @return {Boolean}
     */
    function isReserved (chr) {
        return chr === ':' || chr === '/' || chr === '?' || chr === '#' || chr === '[' || chr === ']' || chr === '@' || chr === '!' || chr === '$' || chr === '&' || chr === '(' ||
            chr === ')' || chr === '*' || chr === '+' || chr === ',' || chr === ';' || chr === '=' || chr === "'";
    }

    return {
        isVarchar: isVarchar,
        isUnreserved: isUnreserved,
        isReserved: isReserved
    };

}());

/**
 * encoding of rfc 6570
 */
var encodingHelper = (function () {

    function encode (text, passReserved) {
        var
            result = '',
            index,
            chr = '';
        if (typeof text === "number" || typeof text === "boolean") {
            text = text.toString();
        }
        for (index = 0; index < text.length; index += chr.length) {
            chr = text.charAt(index);
            result += rfcCharHelper.isUnreserved(chr) || (passReserved && rfcCharHelper.isReserved(chr)) ? chr : pctEncoder.encodeCharacter(chr);
        }
        return result;
    }

    function encodePassReserved (text) {
        return encode(text, true);
    }

    return {
        encode: encode,
        encodePassReserved: encodePassReserved
    };

}());


// the operators defined by rfc 6570
var operators = (function () {

    var
        bySymbol = {};

    function create(symbol) {
        bySymbol[symbol] = {
            symbol: symbol,
            separator: (symbol === '?') ? '&' : (symbol === '' || symbol === '+' || symbol === '#') ? ',' : symbol,
            named: symbol === ';' || symbol === '&' || symbol === '?',
            ifEmpty: (symbol === '&' || symbol === '?') ? '=' : '',
            first: (symbol === '+' ) ? '' : symbol,
            encode: (symbol === '+' || symbol === '#') ? encodingHelper.encodePassReserved : encodingHelper.encode,
            toString: function () {
                return this.symbol;
            }
        };
    }

    create('');
    create('+');
    create('#');
    create('.');
    create('/');
    create(';');
    create('?');
    create('&');
    return {valueOf: function (chr) {
        if (bySymbol[chr]) {
            return bySymbol[chr];
        }
        if ("=,!@|".indexOf(chr) >= 0) {
            throw new Error('Illegal use of reserved operator "' + chr + '"');
        }
        return bySymbol[''];
    }};
}());


/**
 * Detects, whether a given element is defined in the sense of rfc 6570
 * Section 2.3 of the RFC makes clear defintions:
 * * undefined and null are not defined.
 * * the empty string is defined
 * * an array ("list") is defined, if it contains at least one defined element
 * * an object ("map") is defined, if it contains at least one defined property
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
    if (objectHelper.isArray(object)) {
        for (index = 0; index < object.length; index += 1) {
            if (isDefined(object[index])) {
                return true;
            }
        }
        return false;
    }
    if (typeof object === "string" || typeof object === "number" || typeof object === "boolean") {
        // falsy values like empty strings, false or 0 are "defined"
        return true;
    }
    // else Object
    for (propertyName in object) {
        if (object.hasOwnProperty(propertyName) && isDefined(object[propertyName])) {
            return true;
        }
    }
    return false;
}

var LiteralExpression = (function () {
    function LiteralExpression (literal) {
        this.literal = LiteralExpression.encodeLiteral(literal);
    }

    LiteralExpression.encodeLiteral = function (literal) {
        var
            result = '',
            index,
            chr = '';
        for (index = 0; index < literal.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(literal, index);
            if (chr.length > 1) {
                result += chr;
            }
            else {
                result += rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
            }
            // chr = literal.charAt(index);
            // result += rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
        }
        return result;
    };

    LiteralExpression.prototype.expand = function () {
        return this.literal;
    };

    LiteralExpression.prototype.toString = LiteralExpression.prototype.expand;

    return LiteralExpression;
}());

var parse = (function () {
    function parseExpression (outerText) {
        var
            text,
            operator,
            varspecs = [],
            varspec = null,
            varnameStart = null,
            maxLengthStart = null,
            index,
            chr = '';

        function closeVarname () {
            varspec = {varname: text.substring(varnameStart, index), exploded: false, maxLength: null};
            varnameStart = null;
        }

        function closeMaxLength () {
            if (maxLengthStart === index) {
                throw new Error("after a ':' you have to specify the length. position = " + index);
            }
            varspec.maxLength = parseInt(text.substring(maxLengthStart, index), 10);
            maxLengthStart = null;
        }

        // remove outer braces
        text = outerText.substr(1, outerText.length - 2);

        // determine operator
        operator = operators.valueOf(text.charAt(0));
        index = (operator.symbol === '') ? 0 : 1;
        varnameStart = index;

        for (; index < text.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(text, index);
            if (varnameStart !== null) {
                // the spec says: varname =  varchar *( ["."] varchar )
                // so a dot is allowed except for the first char
                if (chr === '.') {
                    if (varnameStart === index) {
                        throw new Error('a varname MUST NOT start with a dot -- see position ' + index);
                    }
                    continue;
                }
                if (rfcCharHelper.isVarchar(chr)) {
                    continue;
                }
                closeVarname();
            }
            if (maxLengthStart !== null) {
                if (index === maxLengthStart && chr === '0') {
                    throw new Error('A :prefix must not start with digit 0 -- see position ' + index);
                }
                if (charHelper.isDigit(chr)) {
                    if (index - maxLengthStart >= 4) {
                        throw new Error('A :prefix must max 4 digits -- see position ' + index);
                    }
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
            throw new Error("illegal character '" + chr + "' at position " + index + ' of "' + text + '"');
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

    function parseTemplate (uriTemplateText) {
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
    }

    return parseTemplate;
}());

var VariableExpression = (function () {
    // helper function if JSON is not available
    function prettyPrint (value) {
        return JSON ? JSON.stringify(value) : value;
    }

    function VariableExpression (templateText, operator, varspecs) {
        this.templateText = templateText;
        this.operator = operator;
        this.varspecs = varspecs;
    }

    VariableExpression.prototype.toString = function () {
        return this.templateText;
    };

    VariableExpression.prototype.expand = function (variables) {
        var
            result = '',
            index,
            varspec,
            value,
            valueIsArr,
            isFirstVarspec = true,
            operator = this.operator;

        // callback to be used within array.reduce
        function reduceUnexploded (result, currentValue, currentKey) {
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

        function reduceNamedExploded (result, currentValue, currentKey) {
            if (isDefined(currentValue)) {
                if (result.length > 0) {
                    result += operator.separator;
                }
                result += (valueIsArr) ? LiteralExpression.encodeLiteral(varspec.varname) : operator.encode(currentKey);
                result += '=' + operator.encode(currentValue);
            }
            return result;
        }

        function reduceUnnamedExploded (result, currentValue, currentKey) {
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
                result += operator.first;
                isFirstVarspec = false;
            }
            else {
                result += operator.separator;
            }
            valueIsArr = objectHelper.isArray(value);
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                value = value.toString();
                if (operator.named) {
                    result += LiteralExpression.encodeLiteral(varspec.varname);
                    if (value === '') {
                        result += operator.ifEmpty;
                        continue;
                    }
                    result += '=';
                }
                if (varspec.maxLength !== null) {
                    value = value.substr(0, varspec.maxLength);
                }
                result += operator.encode(value);
            }
            else if (varspec.maxLength) {
                // 2.4.1 of the spec says: "Prefix modifiers are not applicable to variables that have composite values."
                throw new Error('Prefix modifiers are not applicable to variables that have composite values. You tried to expand ' + this + " with " + prettyPrint(value));
            }
            else if (!varspec.exploded) {
                if (operator.named) {
                    result += LiteralExpression.encodeLiteral(varspec.varname);
                    if (!isDefined(value)) {
                        result += operator.ifEmpty;
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

        if (isFirstVarspec) {
            // so no varspecs produced output.
            var oneExploded = false;
            for (index = 0; index < this.varspecs.length; index += 1) {
                if (this.varspecs[index].exploded) {
                    oneExploded = true;
                    break;
                }
            }
            if (operator.named && !oneExploded) {
                result += operator.symbol;
                result += varspec.varname + operator.ifEmpty;
            }
        }

        return result;
    };

    return VariableExpression;
}());

var UriTemplate = (function () {
    function UriTemplate (templateText, expressions) {
        this.templateText = templateText;
        this.expressions = expressions;
        objectHelper.deepFreeze(this);
    }

    UriTemplate.prototype.toString = function () {
        return this.templateText;
    };

    UriTemplate.prototype.expand = function (variables) {
        // this.expressions.map(function (expression) {return expression.expand(variables);}).join('');
        var
            index,
            result = '';
        for (index = 0; index < this.expressions.length; index += 1) {
            result += this.expressions[index].expand(variables);
        }
        return result;
    };

    UriTemplate.parse = parse;
    return UriTemplate;
}());

    exportCallback(UriTemplate);

}(function (UriTemplate) {
        "use strict";
        // export UriTemplate, when module is present, or pass it to window or global
        if (typeof module !== "undefined") {
            module.exports = UriTemplate;
        }
        else if (typeof define === "function") {
            define([],function() {
                return UriTemplate;
            });
        }
        else if (typeof window !== "undefined") {
            window.UriTemplate = UriTemplate;
        }
        else {
            global.UriTemplate = UriTemplate;
        }
    }
));
