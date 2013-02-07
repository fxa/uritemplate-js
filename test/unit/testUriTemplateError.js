module.exports = (function () {
    "use strict";

    var context = {};
    require('nodeunit').utils.sandbox('src/UriTemplateError.js', context);
    var UriTemplateError = context.UriTemplateError;

    return {
        "meaningful toString": function (test) {
            var error = new UriTemplateError({});
            test.equal(error.toString().indexOf('object'), -1);
            test.done();
        }
    };
}());
