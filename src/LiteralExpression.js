/*jshint unused:false */
/*global pctEncoder, rfcCharHelper, encodingHelper*/
var LiteralExpression = (function () {
    "use strict";
    function LiteralExpression (literal) {
        this.literal = encodingHelper.encodeLiteral(literal);
    }

    LiteralExpression.prototype.expand = function () {
        return this.literal;
    };

    LiteralExpression.prototype.toString = LiteralExpression.prototype.expand;

    return LiteralExpression;
}());
