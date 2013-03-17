module.exports = (function () {
    "use strict";

    var context = {};
    require('nodeunit').utils.sandbox('src/objectHelper.js', context);
    var objectHelper = context.objectHelper;

    return {
        'deepFreeze': {
            'deepFreeze freezes an object': function (test) {
                var object = {};
                objectHelper.deepFreeze(object);
                test.ok(Object.isFrozen(object));
                test.done();
            },
            'deepFreeze freezes children': function (test) {
                var object = {child: {}};
                objectHelper.deepFreeze(object);
                test.ok(Object.isFrozen(object));
                test.ok(Object.isFrozen(object.child));
                test.done();
            },
            'deepFreeze works with arrays': function (test) {
                var object = {child: []};
                objectHelper.deepFreeze(object);
                test.ok(Object.isFrozen(object));
                test.ok(Object.isFrozen(object.child));
                test.done();
            },
            'deepFreeze works with null': function (test) {
                objectHelper.deepFreeze(null);
                test.done();
            }
        }

    };
}());
