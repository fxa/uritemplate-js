module.exports = (function () {
    "use strict";

    var isDefined = (function () {
        var context = {};
        require('nodeunit').utils.sandbox('src/objectHelper.js', context);
        require('nodeunit').utils.sandbox('src/isDefined.js', context);
        return context.isDefined;
    }());

    return {
        'special "undefined" value, such as undef or null are not "defined"': function (test) {
            test.ok(!isDefined(null));
            test.ok(!isDefined(undefined));
            test.done();
        },
        'A variable value that is a string of length zero is not considered undefined': function (test) {
            test.ok(isDefined(''));
            test.done();
        },
        'A variable defined as a list value is considered undefined if the list contains zero members': {
            /*
            'empty array is undefined': function (test) {
                test.ok(!isDefined([]));
                test.done();
            },
            */
            'array containing only null is defined': function (test) {
                test.ok(isDefined([null]));
                test.done();
            },
            'array containing only undefined is defined': function (test) {
                test.ok(isDefined([undefined]));
                test.done();
            },
            'array containing only empty array is defined': function (test) {
                test.ok(isDefined([
                    []
                ]));
                test.done();
            },
            'array containing only empty object is defined': function (test) {
                test.ok(isDefined([
                    {}
                ]));
                test.done();
            },
            'array containing empty string is defined': function (test) {
                test.ok(isDefined(['']));
                test.done();
            }
        },
        // propably the longest id I ever wrote. The text is from the RFC
        'A variable defined as an associative array of (name, value) pairs is considered undefined if the array contains zero members or if all member names in the array are associated with undefined values':  {
            'the empty object is not "defined"': function (test) {
                test.ok(!isDefined({}));
                test.done();
            },
            'null is a pretty member name': function (test) {
                test.ok(isDefined({null: 1}));
                test.done();
            },
            'not defined if all values are not "defined': function (test) {
                test.ok(!isDefined({a: null, b: undefined, c: {}}));
                test.done();
            }
        }


    };
}());
