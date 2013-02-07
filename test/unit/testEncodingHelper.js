module.exports = (function () {
    "use strict";

    var
        sandbox = require('nodeunit').utils.sandbox,
        context = {};
    sandbox('src/charHelper.js', context);
    sandbox('src/pctEncoder.js', context);
    sandbox('src/rfcCharHelper.js', context);
    sandbox('src/encodingHelper.js', context);
    var encodingHelper = context.encodingHelper;

    return {
        'encodeLiteral works as expected': function (test) {
            test.equal(typeof encodingHelper.encodeLiteral, 'function');
            test.equal(encodingHelper.encodeLiteral('a b'), 'a%20b');
            test.equal(encodingHelper.encodeLiteral('a%20b'), 'a%20b');
            test.done();
        }
    };
}());