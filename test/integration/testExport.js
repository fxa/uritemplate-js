module.exports = (function () {
    "use strict";

    var
        fs = require('fs'),
        path = require('path'),
        sandbox = require('nodeunit').utils.sandbox;

    function globalUriTemplateFile() {
        return global.URI_TEMPLATE_FILE;
    }

    function globalUriTemplateFileIsMinified() {
        return globalUriTemplateFile().indexOf('-min.') >= 0;
    }

    var NOISY = false;

    function log(text) {
        if (NOISY) {
            console.log(text);
        }
    }

    function isUriTemplateFuncion (func) {
        return typeof func === 'function' && (
            globalUriTemplateFileIsMinified()
            || (
                func.name === 'UriTemplate'
                && typeof func.parse === 'function'
                && typeof func.prototype.expand === 'function'
            ));
    }

    return {
        'UriTemplate can be required': function (test) {
            var context = {module: {}};
            sandbox(globalUriTemplateFile(), context);
            test.ok(isUriTemplateFuncion(context.module.exports));
            test.done();
        },
        'UriTemplate can be defined with AMD': function (test) {
            var context = {define: function (arr, func) {
                test.ok(Array.isArray(arr));
                test.strictEqual(typeof func, 'function');
                test.ok(isUriTemplateFuncion(func()));
                test.done();
            }};
            sandbox(globalUriTemplateFile(), context);
        },
        'UriTemplate can be put in window of Browser': function (test) {
            var context = {window: {}};
            sandbox(globalUriTemplateFile(), context);
            test.ok(isUriTemplateFuncion(context.window.UriTemplate));
            test.done();
        },
        'UriTemplate can be loaded in global object': function (test) {
            var context = {global: {}};
            sandbox(globalUriTemplateFile(), context);
            test.ok(isUriTemplateFuncion(context.global.UriTemplate));
            test.done();
        }
    }

}());