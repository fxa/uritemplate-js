/*jshint unused:false */
/*global pctEncoder, operators, charHelper, rfcCharHelper, LiteralExpression, UriTemplate, VariableExpression */
var parse = (function () {
    "use strict";

    function parseExpression(outerText) {
        var
            text,
            operator,
            varspecs = [],
            varspec = null,
            varnameStart = null,
            maxLengthStart = null,
            index,
            chr = '';

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

        // remove outer {}
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
                if (charHelper.isDigit(chr)) {
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

    function parseTemplate(uriTemplateText) {
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
