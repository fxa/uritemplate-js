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
    sandbox('src/LiteralExpression.js', context);
    sandbox('src/VariableExpression.js', context);

    var operators = context.operators;
    var VariableExpression = context.VariableExpression;

    return {
        'unexploded': {
            'empty is in list': function (test) {
                var ve = new VariableExpression("{x,empty}", operators.valueOf(''), [
                    {varname: 'x', exploded: false, maxLength: null},
                    {varname: 'empty', exploded: false, maxLength: null}
                ]);
                test.equal(ve.expand({x: 'x', empty:''}), 'x,');
                test.done();
            },
            'null is not in list': function (test) {
                var ve = new VariableExpression("{x,undef}", operators.valueOf(''), [
                    {varname: 'x', exploded: false, maxLength: null},
                    {varname: 'empty', exploded: false, maxLength: null}
                ]);
                test.equal(ve.expand({x: 'x', undef: null}), 'x');
                test.done();
            },
            'when empty list and not named, the operator is not printed': function (test) {
                var ve = new VariableExpression("{.empty_list}", operators.valueOf('.'), [
                    {varname: 'empty_list', exploded: false, maxLength: null}
                ]);
                test.equal(ve.expand({empty_list: []}), '');
                test.done();
            },
            'when empty list and named, the operator is printed': function (test) {
                var ve = new VariableExpression("{?empty_list}", operators.valueOf('?'), [
                    {varname: 'empty_list', exploded: false, maxLength: null}
                ]);
                test.equal(ve.expand({empty_list: []}), '?empty_list=');
                test.done();
            }
        },
        'exploded': {
            'unnamed': {
                'a map shows a key-val list': function (test) {
                    var ve = new VariableExpression("{keys*}", operators.valueOf(''), [
                        {varname: 'keys', exploded: true, maxLength: null}
                    ]);
                    test.equal(ve.expand({keys: {a: 'a', b: 'b', c: 'c'}}), 'a=a,b=b,c=c');
                    test.done();
                },
                'a map works with numbers': function (test) {
                    var ve = new VariableExpression("{keys*}", operators.valueOf(''), [
                        {varname: 'keys', exploded: true, maxLength: null}
                    ]);
                    test.equal(ve.expand({keys: {a: 'a', two: 2}}), 'a=a,two=2');
                    test.done();
                },
                'a map works with booleans': function (test) {
                    var ve = new VariableExpression("{keys*}", operators.valueOf(''), [
                        {varname: 'keys', exploded: true, maxLength: null}
                    ]);
                    test.equal(ve.expand({keys: {a: 'a', true: true}}), 'a=a,true=true');
                    test.done();
                },
                'a empty map prints no operator': function (test) {
                    var ve = new VariableExpression("{.empty_map*}", operators.valueOf('.'), [
                        {varname: 'empty_map', exploded: true, maxLength: null}
                    ]);
                    test.equal(ve.expand({empty_map: {}}), '');
                    test.done();
                },
                                
                'empty elements have the name and =': function (test) {
                    var ve = new VariableExpression("{?map*}", operators.valueOf('?'), [
                        {varname: 'map', exploded: true, maxLength: null}
                    ]);
                    test.equal(ve.expand({map: {a:'a', empty: ''}}), '?a=a&empty=');
                    test.done();
                },
                'empty elements have the name and no =, if the operator has no ifemp ': function (test) {
                    var ve = new VariableExpression("{;map*}", operators.valueOf(';'), [
                        {varname: 'map', exploded: true, maxLength: null}
                    ]);
                    test.equal(ve.expand({map: {a:'a', empty: ''}}), ';a=a;empty');
                    test.done();
                }
            },
            'named': {
                'a named, exploded list repeats the name': function (test) {
                    var ve = new VariableExpression("{;count*}", operators.valueOf(';'), [
                        {varname: 'count', exploded: true, maxLength: null}
                    ]);
                    test.equal(ve.expand({count: ['one', 'two', 'three']}), ';count=one;count=two;count=three');
                    test.done();
                }
            }
        },
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
            var ve = new VariableExpression("{?empty_list}", operators.valueOf('?'), [
                {varname: 'empty_list', exploded: false, maxLength: null}
            ]);
            test.equal(ve.expand({empty_list: {}}), '?empty_list=');
            test.done();
        },
        "exploded empty lists with ? must not show the name": function (test) {
            var ve = new VariableExpression("{?empty_list*}", operators.valueOf('?'), [
                {varname: 'empty_list', exploded: true, maxLength: null}
            ]);
            test.equal(ve.expand({empty_list: []}), '');
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
        },
        'query expression with 1 varname will expand to empty, if data is undef': function (test) {
            var ve = new VariableExpression("{?a}", operators.valueOf('?'), [
                {varname: 'a', exploded: false}
            ]);
            test.equal(ve.expand({}), '');
            test.done();
        },
        'query expression with more than 1 varname will expand to empty, if data is undef': function (test) {
            var ve = new VariableExpression("{?a,b,c}", operators.valueOf('?'), [
                {varname: 'a', exploded: false},
                {varname: 'b', exploded: false},
                {varname: 'c', exploded: false}
            ]);
            test.equal(ve.expand({}), '');
            test.done();
        }

    };
}());