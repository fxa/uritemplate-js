/*jshint unused:false */
/*global parse*/
var UriTemplate = (function () {
    "use strict";
    function UriTemplate(templateText, expressions) {
        this.templateText = templateText;
        this.expressions = expressions;
    }

    UriTemplate.prototype.toString = function () {
        return this.templateText;
    };

    UriTemplate.prototype.expand = function (variables) {
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
