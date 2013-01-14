/*jshint unused:false */
/*global pctEncoder, rfcCharHelper*/
var LiteralExpression = (function () {
    "use strict";

    function encodeLiteral(literal) {
        var
            result = '',
            index,
            chr = '';
        for (index = 0; index < literal.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(literal, index);
            if (chr.length > 0) {
                result += chr;
            }
            else {
                result += rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
            }
        }
        return result;
    }

    function LiteralExpression(literal) {
        this.literal = LiteralExpression.encodeLiteral(literal);
    }

    LiteralExpression.encodeLiteral = encodeLiteral;


    LiteralExpression.prototype.expand = function () {
        return this.literal;
    };

    LiteralExpression.prototype.toString = LiteralExpression.prototype.expand;

    return LiteralExpression;
}());
