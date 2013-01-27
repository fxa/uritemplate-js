module.exports = (function () {
    "use strict";

    var
        sandbox = require('nodeunit').utils.sandbox,
        context = {};
    sandbox('src/objectHelper.js', context);
    sandbox('src/charHelper.js', context);
    sandbox('src/pctEncoder.js', context);
    sandbox('src/rfcCharHelper.js', context);
    sandbox('src/encodingHelper.js', context);
    sandbox('src/operators.js', context);
    sandbox('src/isDefined.js', context);
    sandbox('src/LiteralExpression.js', context);
    sandbox('src/VariableExpression.js', context);

    var operators = context.operators;
    var VariableExpression = context.VariableExpression;

    return {
        "there must be no separator at the end of the level3 list": function (test) {
            var ve = new VariableExpression("{+x,y}", operators.valueOf('+'), [
                {varname: 'x', exploded: false, maxLength: null},
                {varname: 'y', exploded: false, maxLength: null}
            ]);
            test.equal(ve.expand({x: 1, y: 2}), '1,2');
            test.equal(ve.expand({x: 1, y: null}), '1');
            test.done();
        },
        "empty lists with ? must show the name": function (test) {
            var ve = new VariableExpression("{?empty}", operators.valueOf('?'), [
                {varname: 'empty', exploded: false, maxLength: null}
            ]);
            test.equal(ve.expand({empty: {}}), '?empty=');
            test.done();
        },
        "exploded empty lists with ? must not show the name": function (test) {
            var ve = new VariableExpression("{?empty*}", operators.valueOf('?'), [
                {varname: 'empty', exploded: true, maxLength: null}
            ]);
            test.equal(ve.expand({empty: {}}), '');
            test.done();
        },
        "double encode if ?": function (test) {
            var ve = new VariableExpression("{?uri", operators.valueOf('?'), [
                {varname: 'uri', exploded: false, maxLength: null}
            ]);
            test.equal(ve.expand({uri: 'http://example.org/?ref=http%3A%2F%2Fother.org%2F'}), '?uri=http%3A%2F%2Fexample.org%2F%3Fref%3Dhttp%253A%252F%252Fother.org%252F');
            test.done();
        },
        "not double encode if +": function (test) {
            var ve = new VariableExpression("{+uri", operators.valueOf('+'), [
                {varname: 'uri', exploded: false, maxLength: null}
            ]);
            test.equal(ve.expand({uri: 'http://example.org/?ref=http%3A%2F%2Fother.org%2F'}), 'http://example.org/?ref=http%253A%252F%252Fother.org%252F');
            test.done();
        },
        'maxLength is used': function (test) {
            var ve = new VariableExpression("{one:1}", operators.valueOf(''), [
                {varname: 'one', exploded: false, maxLength: 1}
            ]);
            test.equal(ve.expand({one: 'two'}), 't');
            test.done();
        }
    };
}());