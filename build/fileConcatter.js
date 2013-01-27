module.exports = (function () {
    "use strict";

    var
        fs = require('fs'),
        async = require('async');

    function readFileUtf8 (filename, callback) {
        // if you call readFile with encoding, the result is the file content as string.
        // without encoding it would be a stream, which can be converted to a string with its toString() method
        fs.readFile(filename, 'utf-8', callback);
    }

    function concat (inputFileArr, outputfile, callback, options) {
        async.map(inputFileArr, readFileUtf8, function (err, contents) {
            if (err) {
                throw new Error('could not read files: ' + err);
            }
            if (options && options.mapper) {
                if (Array.isArray(options.mapper)) {
                    options.mapper.forEach(function (map) {
                        contents = contents.map(map);
                    });
                }
                else {
                    contents = contents.map(options.mapper);
                }
            }
            var concatenatedContent = contents.reduce(function (previousValue, currentValue) {
                return previousValue + '\n' + currentValue;
            });
            if (options && options.preAll) {
                var pre = typeof options.preAll === 'string' ? options.preAll : options.preAll(concatenatedContent);
                concatenatedContent = pre + concatenatedContent;
            }
            if (options && options.postAll) {
                var post = typeof options.postAll === 'string' ? options.postAll : options.postAll(concatenatedContent);
                concatenatedContent = concatenatedContent + post;
            }
            fs.writeFile(outputfile, concatenatedContent, 'utf-8', callback);
        });
    }

    function startsWith (text, beginning) {
        return text.substr(0, beginning.length) === beginning;
    }

    function removeFirstLine (text) {
        var indexOfLinebreak = text.indexOf("\n");
        if (indexOfLinebreak < 0) {
            return text;
        }
        return text.substr(indexOfLinebreak + 1);
    }

    function removeUseStrict (text) {
        var lines = text.split('\n');
        var filteredLines = lines.filter(function (line) {
            return line.indexOf('"use strict"') < 0;
        });
        return filteredLines.join('\n');
    }

    function removeJshintOptions (source) {
        if (startsWith(source, '/*jshint')) {
            source = removeFirstLine(source);
        }
        if (startsWith(source, '/*global')) {
            source = removeFirstLine(source);
        }
        return source;
    }

    return {
        concat: concat,
        removeJshintOptions: removeJshintOptions,
        removeUseStrict: removeUseStrict
    };
}());