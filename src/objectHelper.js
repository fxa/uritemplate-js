/*jshint unused: false */
var objectHelper = (function () {
    "use strict";

    function isArray(value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    }

    // performs an array.reduce for objects
    // TODO handling if initialValue is undefined
    function objectReduce(object, callback, initialValue) {
        var
            propertyName,
            currentValue = initialValue;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                currentValue = callback(currentValue, object[propertyName], propertyName, object);
            }
        }
        return currentValue;
    }

    // performs an array.reduce, if reduce is not present (older browser...)
    // TODO handling if initialValue is undefined
    function arrayReduce(array, callback, initialValue) {
        var
            index,
            currentValue = initialValue;
        for (index = 0; index < array.length; index += 1) {
            currentValue = callback(currentValue, array[index], index, array);
        }
        return currentValue;
    }

    function reduce(arrayOrObject, callback, initialValue) {
        return isArray(arrayOrObject) ? arrayReduce(arrayOrObject, callback, initialValue) : objectReduce(arrayOrObject, callback, initialValue);
    }

    return {
        isArray: isArray,
        reduce: reduce
    };
}());
