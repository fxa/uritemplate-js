
module.exports = (function () {
    "use strict";

    var
        sandbox = require('nodeunit').utils.sandbox,
        context = {};
    sandbox('src/UriTemplateError.js', context);
    sandbox('src/objectHelper.js', context);
    sandbox('src/charHelper.js', context);
    sandbox('src/pctEncoder.js', context);
    sandbox('src/rfcCharHelper.js', context);
    sandbox('src/encodingHelper.js', context);
    sandbox('src/operators.js', context);
    sandbox('src/isDefined.js', context);
    sandbox('src/LiteralExpression.js', context);
    sandbox('src/parse.js', context);
    sandbox('src/VariableExpression.js', context);
    sandbox('src/UriTemplate_.js', context);

    var
        operators = context.operators,
        VariableExpression = context.VariableExpression,
        UriTemplate = context.UriTemplate;

    return {
        'UriTemplate has a static parse function': function (test) {
            test.equal(typeof UriTemplate.parse, 'function');
            test.done();
        },
        'UriTemplate has a expand function': function (test) {
            test.equal(typeof UriTemplate.prototype.expand, 'function');
            test.done();
        },
        'UriTemplate instances are frozen': function (test) {
            var ut = new UriTemplate('text', []);
            test.ok(Object.isFrozen(ut));
            test.ok(Object.isFrozen(ut.expressions));
            test.done();
        }
    };
}());
