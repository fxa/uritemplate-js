module.exports = (function () {
    "use strict";

    var
        sandbox = require('nodeunit').utils.sandbox,
        context = {};
    sandbox('src/charHelper.js', context);
    sandbox('src/pctEncoder.js', context);
    var charHelper = context.charHelper;
    var pctEncoder = context.pctEncoder;

    return {
        'isPctEncoded': {
            'one byte utf8 characters are recognized': function (test) {
                test.ok(pctEncoder.isPctEncoded('%00'));
                test.ok(pctEncoder.isPctEncoded('%7F'));
                test.ok(!pctEncoder.isPctEncoded('%80'));
                test.ok(!pctEncoder.isPctEncoded('%C0'));
                test.ok(!pctEncoder.isPctEncoded('%FF'));
                test.done();
            },
            'two byte utf8 characters are recognized': function (test) {
                test.ok(pctEncoder.isPctEncoded('%C3%B6'));
                test.ok(!pctEncoder.isPctEncoded('%C1%B6'));
                test.ok(!pctEncoder.isPctEncoded('%C3%7F'));
                test.ok(!pctEncoder.isPctEncoded('%C3%C0'));
                test.done();
            },
            'three byte utf8 characters are recognized': function (test) {
                // the euro sign
                test.ok(pctEncoder.isPctEncoded('%E2%82%AC'));
                test.ok(!pctEncoder.isPctEncoded('%E2%82'));
                test.done();
            },
            'four byte utf8 characters are recognized': function (test) {
                // violin clef
                test.ok(pctEncoder.isPctEncoded('%F0%9D%84%9E'));
                test.ok(!pctEncoder.isPctEncoded('%F0%9D%84'));
                test.done();
            }
        },
        'pctCharAt': {
            'corner cases are detected': function (test) {
                test.equal(pctEncoder.pctCharAt('%', 0), '%');
                test.equal(pctEncoder.pctCharAt('%X', 0), '%');
                test.equal(pctEncoder.pctCharAt('%A', 0), '%');
                test.equal(pctEncoder.pctCharAt('%1', 0), '%');
                test.equal(pctEncoder.pctCharAt('%F0%9D%8', 0), '%');
                test.equal(pctEncoder.pctCharAt('%20', 1), '2');
                test.done();
            },
            'one byte utf8 characters are detected': function (test) {
                test.equal(pctEncoder.pctCharAt('%25%', 0), '%25');
                test.equal(pctEncoder.pctCharAt('%3C%', 0), '%3C');
                test.equal(pctEncoder.pctCharAt('%3c%', 0), '%3c');
                test.done();
            }
        },
        'encodeCharacter': {
            'encodeCharacter encodes even if not needed': function (test) {
                test.equal(pctEncoder.encodeCharacter('y'), '%79');
                test.equal(pctEncoder.encodeCharacter('!'), '%21');
                test.done();
            },
            'encoding is always padded': function (test) {
                test.equal(pctEncoder.encodeCharacter('\n'), '%0A');
                test.done();
            }
        }
    };
}());

