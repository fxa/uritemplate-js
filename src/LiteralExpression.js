/*jshint unused:false */
/*global pctEncoder, rfcCharHelper*/
var LiteralExpression = (function () {
    "use strict";
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
