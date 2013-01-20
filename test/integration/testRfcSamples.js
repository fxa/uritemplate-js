module.exports = (function () {
    "use strict";

    var
        fs = require('fs'),
        path = require('path'),
        sandbox = require('nodeunit').utils.sandbox;
    // var testCase = require('nodeunit').testCase;

    var NOISY = false;
    function log(text) {
        if (NOISY) {
            console.log(text);
        }
    }


    function loadUriTemplate() {
        var context = {module: {}};
        sandbox(global.URI_TEMPLATE_FILE, context);
        return context.module.exports;
    }

    function loadTestFile(testFileName) {
        return JSON.parse(fs.readFileSync(testFileName));
    }

    function assertMatches(test, template, variables, expected, chapterName, UriTemplate) {
        var
            uriTemplate,
            actual,
            index;
        try {
            uriTemplate = UriTemplate.parse(template);
        }
        catch (error) {
            // if expected === false, the error was expected!
            if (expected === false) {
                log('ok. expected error found');
                return;
            }
            log('error', error);
            test.fail('chapter ' + chapterName + ', template ' + template + ' threw error: ' + error);
            return;
        }
        test.ok(!!uriTemplate, 'uri template could not be parsed');
        try {
            actual = uriTemplate.expand(variables);
            if (expected === false) {
                test.fail('chapter ' + chapterName + ', template ' + template + ' expected to fail, but returned \'' + actual + '\'!');
                return;
            }
        }
        catch (exception) {
            if (expected === false) {
                return;
            }
            test.fail('chapter ' + chapterName + ', template ' + template + ' threw error: ' + JSON.stringify(exception, null, 4));
            return;
        }
        if (expected.constructor === Array) {
            // simplyfy arrays, when only one element is in
            if (expected.length === 1) {
                expected = expected[0];
            }
        }
        if (expected.constructor === Array) {
            // actual must match at least one of the listed elements
            for (index = 0; index < expected.length; index += 1) {
                if (actual === expected[index]) {
                    return;
                }
            }
            test.fail("actual: '" + actual + "', expected: one of " + JSON.stringify(expected) + ', chapter ' + chapterName + ', template ' + template);
        }
        else {
            test.equal(actual, expected, 'actual: ' + actual + ', expected: ' + expected + ', template: ' + template);
        }
    }

    function runTestFile(test, filename) {
        var
            tests,
            chapterName,
            chapter,
            variables,
            index,
            template,
            expexted,
            UriTemplate;
        log(filename);
        UriTemplate = loadUriTemplate();
        tests = loadTestFile(filename);
        for (chapterName in tests) {
            if (tests.hasOwnProperty(chapterName)) {
                log('-> ' + chapterName);
                chapter = tests[chapterName];
                variables = chapter.variables;
                for (index = 0; index < chapter.testcases.length; index += 1) {
                    template = chapter.testcases[index][0];
                    expexted = chapter.testcases[index][1];
                    log('   -> ' + template);
                    assertMatches(test, template, variables, expexted, chapterName, UriTemplate);
                }
            }
        }
        test.done();
    }

    var SPEC_HOME = 'uritemplate-test';

    return {
        'spec examples': function (test) {
            runTestFile(test, path.join(SPEC_HOME, 'spec-examples.json'));
        },
        'extended tests': function (test) {
            runTestFile(test, path.join(SPEC_HOME, 'extended-tests.json'));
        },
        /* negative tests have invalid specs in it -- they were fixed in a later version of  the test
        'negative tests': function (test) {
            runTestFile(test, path.join(SPEC_HOME, 'negative-tests.json'));
        },
        */
        'own tests': function (test) {
            runTestFile(test, 'own-testcases.json');
        }
    };
}());
