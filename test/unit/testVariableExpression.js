module.exports = (function () {
    "use strict";

    var
        sandbox = require('nodeunit').utils.sandbox,
        context = {console: console};
    sandbox('src/objectHelper.js', context);
    sandbox('src/charHelper.js', context);
    sandbox('src/pctEncoder.js', context);
    sandbox('src/rfcCharHelper.js', context);
    sandbox('src/encodingHelper.js', context);
    sandbox('src/operators.js', context);
    sandbox('src/isDefined.js', context);
    sandbox('src/VariableExpression.js', context);

    // var charHelper = context.charHelper;
    // var pctEncoder = context.pctEncoder;
    // var encodingHelper = context.encodingHelper;
    var operators = context.operators;
    var VariableExpression = context.VariableExpression;

    return {
        "exploded empty lists with ? must show the name": function (test) {
            console.log(JSON.stringify(test, null, 4));
            var ve = new VariableExpression("{?empty*}", operators.valueOf('?'), [
                {varname: 'empty', exploded: true, maxLength: null}
            ]);
            test.equal(ve.expand({empty: {}}), '?empty=');
            test.done();
        },
        "there must be no separator at the end of the level3 list": function (test) {
            var ve = new VariableExpression("{+x,y}", operators.valueOf('+'), [
                {varname: 'x', exploded: false, maxLength: null},
                {varname: 'y', exploded: false, maxLength: null}
            ]);
            test.equal(ve.expand({x: 1, y: 2}), '1,2');
            test.equal(ve.expand({x: 1, y: null}), '1');
            test.done();
        }
    };
}());