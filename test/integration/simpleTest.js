module.exports = (function () {
    "use strict";

    var
        UriTemplate = require('../../' + global.URI_TEMPLATE_FILE);

    return {
        'UriTemplate has a parse function': function (test) {
            test.equal(typeof UriTemplate.parse, 'function');
            test.done();
        }
    };
}());
