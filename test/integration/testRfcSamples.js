module.exports = (function () {
    "use strict";

    var
        fs = require('fs'),
        sandbox = require('nodeunit').utils.sandbox;


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
            // console.log('uritemplate parsed:' + uriTemplate);
        }
        catch (error) {
            // console.log('error', error);
            // console.log('expected', expected.toString());
            // if expected === false, the error was expected!
            if (expected === false) {
                return;
            }
            console.log('error', error);
            console.log('expected', expected.toString());
            test.notEqual('chapter ' + chapterName + ', template ' + template + ' threw error: ' + error);
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
            test.notEqual('chapter ' + chapterName + ', template ' + template + ' threw error: ' + JSON.stringify(exception, null, 4));
            return;
        }
        if (expected.constructor === Array) {
            // actual must match at least one of the listed elements
            for (index = 0; index < expected.length; index += 1) {
                if (actual === expected[index]) {
                    return;
                }
            }
            test.notEqual('actual: ' + actual + ', expected: one of ' + JSON.stringify(expected) + 'chapter ' + chapterName + ', template ' + template);
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
        UriTemplate = loadUriTemplate();
        tests = loadTestFile(filename);
        for (chapterName in tests) {
            if (tests.hasOwnProperty(chapterName)) {
                chapter = tests[chapterName];
                variables = chapter.variables;
                for (index = 0; index < chapter.testcases.length; index += 1) {
                    template = chapter.testcases[index][0];
                    expexted = chapter.testcases[index][1];
                    assertMatches(test, template, variables, expexted, chapterName, UriTemplate);
                }
                console.log(chapterName);
            }
        }
        test.done();
    }

    return {
        'spec examples': function (test) {
            runTestFile(test, 'uritemplate-test/spec-examples.json');
        },
        'extended tests': function (test) {
            runTestFile(test, 'uritemplate-test/extended-tests.json');
        },
        // 'negative tests': function (test) {
        //     runTestFile(test, 'uritemplate-test/negative-tests.json');
        // },
        'own tests': function (test) {
            runTestFile(test, 'own-testcases.json');
        }
    };
}());
