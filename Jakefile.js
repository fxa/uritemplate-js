/*jshint */
/*global complete, desc, fail, file, task*/

(function () {
    "use strict";

    var
        async = require('async'),
        path = require('path'),
        fs = require('fs'),
        hinter = require('./build/hinter'),
        jake = require('jake'),
        nodeunit = require('nodeunit'),
        fileConcatter = require('./build/fileConcatter'),
        UglifyJS = require('uglify-js');

    var
        NODEUNIT_OPTIONS = {
            "error_prefix": "",
            "error_suffix": "",
            "ok_prefix": "",
            "ok_suffix": "",
            "bold_prefix": "",
            "bold_suffix": "",
            "assertion_prefix": "",
            "assertion_suffix": ""
        };

    var
        SRC_HOME = 'src',
        SRC_FILES = [
            // cannot use the fileList, because the order matters
            path.join(SRC_HOME, 'objectHelper.js'),
            path.join(SRC_HOME, 'charHelper.js'),
            path.join(SRC_HOME, 'pctEncoder.js'),
            path.join(SRC_HOME, 'rfcCharHelper.js'),
            path.join(SRC_HOME, 'encodingHelper.js'),
            path.join(SRC_HOME, 'operators.js'),
            path.join(SRC_HOME, 'isDefined.js'),
            path.join(SRC_HOME, 'LiteralExpression.js'),
            path.join(SRC_HOME, 'parse.js'),
            path.join(SRC_HOME, 'VariableExpression.js'),
            path.join(SRC_HOME, 'UriTemplate_.js')
        ],
        UNIT_TESTS = new jake.FileList('test/unit/test*.js').toArray(),
        INTEGRATION_TESTS = [
            path.join('test', 'integration', 'simpleTest.js'),
            path.join('test', 'integration', 'testRfcSamples.js')
        ],

        TMP_UNTESTED_UNCOMPRESSED = 'tmp-untested-uritemplate.js',
        TMP_UNTESTED_COMPRESSED = 'tmp-unested-uritemplate-min.js',

        TARGET_HOME = 'bin',
        TARGET_UNCOMPRESSED = path.join(TARGET_HOME, 'uritemplate.js'),
        TARGET_COMPRESSED = path.join(TARGET_HOME, 'uritemplate-min.js'),

        ASYNC = {async: true};

    var all = new jake.FileList();
    all.include('./*');
    all.include('src/**');
    all.include('test/**');
    all.exclude(TARGET_COMPRESSED);
    var TARGET_UNCOMPRESSED_DEPENDENCIES = all.toArray();

    function closeTask(err) {
        if (err) {
            fail(err);
        }
        complete();
    }

    desc('clean');
    task('clean', [], function () {
        function unlinkWhenExists(filename, callback) {
            fs.unlink(filename, function (err) {
                callback(err && err.code !== 'ENOENT' ? err : undefined);
            });
        }

        async.forEach([TMP_UNTESTED_UNCOMPRESSED, TMP_UNTESTED_COMPRESSED, TARGET_UNCOMPRESSED, TARGET_COMPRESSED], unlinkWhenExists, closeTask);
    }, ASYNC);

    file(TARGET_UNCOMPRESSED, TARGET_UNCOMPRESSED_DEPENDENCIES, function () {
        global.URI_TEMPLATE_FILE = TMP_UNTESTED_UNCOMPRESSED;
        async.series([
            function (callback) {
                jake.logger.log('looking for jshint warnings ...');
                hinter.hint(SRC_FILES, callback);
            },
            function (callback) {
                jake.logger.log('unit testing ...');
                nodeunit.reporters['default'].run(UNIT_TESTS, NODEUNIT_OPTIONS, callback);
            },
            function (callback) {
                jake.logger.log('build concatenated version ...');
                fileConcatter.concat(SRC_FILES, TMP_UNTESTED_UNCOMPRESSED, callback, {
                    mapper: [fileConcatter.removeJshintOptions, fileConcatter.removeUseStrict],
                    preAll: fs.readFileSync('src/pre.txt', 'utf-8'),
                    postAll: fs.readFileSync('src/post.txt', 'utf-8')
                });
            },
            function (callback) {
                jake.logger.log('hinting the concatenated version ... ');
                hinter.hint([TMP_UNTESTED_UNCOMPRESSED], callback);
            },
            function (callback) {
                jake.logger.log('integration tests ...');
                nodeunit.reporters['default'].run(INTEGRATION_TESTS, NODEUNIT_OPTIONS, callback);
            },
            function (callback) {
                jake.logger.log('move uncompressed version to target directory');
                fs.rename(TMP_UNTESTED_UNCOMPRESSED, TARGET_UNCOMPRESSED, callback);
            }
        ], closeTask);
    }, ASYNC);

    file(TARGET_COMPRESSED, [TARGET_UNCOMPRESSED], function () {
        global.URI_TEMPLATE_FILE = TMP_UNTESTED_COMPRESSED;
        async.series([
            function (callback) {
                jake.logger.log('compress to temporary file ... ');
                var compressed = UglifyJS.minify(TARGET_UNCOMPRESSED);
                fs.writeFile(TMP_UNTESTED_COMPRESSED, compressed.code, 'utf8', callback);
            },
            function (callback) {
                jake.logger.log('integration tests with minified version ... ');
                nodeunit.reporters['default'].run(INTEGRATION_TESTS, NODEUNIT_OPTIONS, callback);
            },
            function (callback) {
                jake.logger.log('move compressed version to target ... ');
                fs.rename(TMP_UNTESTED_COMPRESSED, TARGET_COMPRESSED, callback);
            }
        ], closeTask);
    }, ASYNC);

    desc('release');
    task('release', [TARGET_COMPRESSED], function () {
        jake.logger.log('done.');
    });
    task('default', ['clean', 'release']);


}());