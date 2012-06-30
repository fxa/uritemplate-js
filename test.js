
(function () {
    "use strict";

    var
        assert = require('assert'),
        fs = require('fs'),
        UriTemplate = require('./src/uritemplate.js'),
        numTestsPassed = 0;

    function assertMatches(template, variables, expected, chapterName) {
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
                return;
            }
            assert.fail('chapter "' + chapterName + '", template "' + template + '" threw error: ' + error);
            return;
        }
        assert.ok(!!uriTemplate, 'uri template could not be parsed');
        try {
            actual = uriTemplate.expand(variables);
            if (expected === false) {
                assert.fail('chapter "' + chapterName + '", template "' + template + '" expected to fail, but returned \'' + actual + '\'!');
                return;
            }
        }
        catch (exception) {
            if (expected === false) {
                return;
            }
            assert.fail('chapter "' + chapterName + '", template "' + template + '" threw error: ' + exception);
            return;
        }
        if (expected.constructor === Array) {
            // actual must match at least one of the listed elements
            for (index = 0; index < expected.length; index += 1) {
                if (actual === expected[index]) {
                    return;
                }
            }
            assert.fail('actual: ' + actual + ', expected: one of ' + JSON.stringify(expected) + ", " + 'chapter "' + chapterName + '", template "' + template + '"');
        }
        else {
            assert.equal(actual, expected, 'actual: "' + actual + '", expected: "' + expected + '", template: "' + template + '"');
        }
    }

    function runTestFile(filename) {
        var
            tests,
            chapterName,
            chapter,
            variables,
            index,
            template,
            expexted;
        tests = JSON.parse(fs.readFileSync(filename));
        for (chapterName in tests) {
            if (tests.hasOwnProperty(chapterName)) {
                chapter = tests[chapterName];
                variables = chapter.variables;
                for (index = 0; index < chapter.testcases.length; index += 1) {
                    template = chapter.testcases[index][0];
                    expexted = chapter.testcases[index][1];
                    assertMatches(template, variables, expexted, chapterName);
                    numTestsPassed += 1;
                }
                console.log(chapterName);
            }
        }
    }

    runTestFile('uritemplate-test/spec-examples.json');
    runTestFile('uritemplate-test/extended-tests.json');
    runTestFile('uritemplate-test/negative-tests.json');
    
    runTestFile('own-testcases.json');
    console.log('passed all ' + numTestsPassed + ' tests!');

}());