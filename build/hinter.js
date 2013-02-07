module.exports = (function () {
    "use strict";

    var
        fs = require('fs'),
        jshint = require("jshint").JSHINT;

    var
    // for a full list and description see http://www.jshint.com/options/
        JSHINT_OPTIONS = {
            bitwise: true, // bitwise is forbidden
            curly: true, // must put oneliners in curly braces
            eqeqeq: true, // must use ===
            forin: true, // for in must use hasOwnProperty()
            immed: true, // immediately called functions must be wrapped in ()
            newcap: true, // CAP constructors
            noarg: true, // arguments.caller is evil
            noempty: true, // empty blocks are forbidden
            nonew: true, // forbids new X(); without assignment
            regexp: true, // warns with wrong dots -- I would prefer to forbid regexps
            strict: true, // must use "use strict"
            undef: true,  // forbids use of undefined variables
            unused: true, // forbids unused variables
            maxcomplexity: 20 // much too high. should be max. 10
        },
        JSHINT_GLOBALS = {
            "module": true
        };

    function hint(jsFiles, callback) {
        var
            failed = false,
            numCheckedFiles = 0;
        jsFiles.forEach(function (jsFile) {
            fs.readFile(jsFile, 'utf-8', function (err, content) {
                if (failed) {
                    return;
                }
                if (err) {
                    callback('could not read file ' + jsFile + ': ' + err);
                    return;
                }
                numCheckedFiles += 1;
                if (!jshint.jshint(content, JSHINT_OPTIONS, JSHINT_GLOBALS)) {
                    failed = true;
                    jshint.errors.push({filename: jsFile});
                    // jshint errors are awfully formated, when given to jake.fail()
                    console.log(JSON.stringify(jshint.errors, null, 4));
                    callback({
                        filename: jsFile,
                        reason: jshint.errors[0].reason
                    });
                }
                if (numCheckedFiles === jsFiles.length) {
                    callback();
                }
            });
        });
    }

    return {
        hint: hint
    };
}());