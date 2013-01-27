module.exports = (function () {
    "use strict";

    var
        sandbox = require('nodeunit').utils.sandbox,
        context = {};
    sandbox('src/charHelper.js', context);
    sandbox('src/pctEncoder.js', context);
    sandbox('src/rfcCharHelper.js', context);
    sandbox('src/encodingHelper.js', context);
    sandbox('src/LiteralExpression.js', context);
    var LiteralExpression = context.LiteralExpression;

    return {
        'LiteralExpression.encodeLiteral works as expected': function (test) {
            test.equal(typeof LiteralExpression.encodeLiteral, 'function');
            test.equal(LiteralExpression.encodeLiteral('a b'), 'a%20b');
            test.equal(LiteralExpression.encodeLiteral('a%20b'), 'a%20b');
            test.done();
        }
    };
}());