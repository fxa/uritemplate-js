/*jshint unused:false */
/*global objectHelper*/

/**
 * Detects, whether a given element is defined in the sense of rfc 6570
 * Section 2.3 of the RFC makes clear defintions:
 * * undefined and null are not defined.
 * * the empty string is defined
 * * an array ("list") is defined, if it contains at least one defined element
 * * an object ("map") is defined, if it contains at least one defined property
 * @param object
 * @return {Boolean}
 */
function isDefined (object) {
    "use strict";
    var
        index,
        propertyName;
    if (object === null || object === undefined) {
        return false;
    }
    if (objectHelper.isArray(object)) {
        for (index = 0; index < object.length; index += 1) {
            if (isDefined(object[index])) {
                return true;
            }
        }
        return false;
    }
    if (typeof object === "string" || typeof object === "number" || typeof object === "boolean") {
        // falsy values like empty strings, false or 0 are "defined"
        return true;
    }
    // else Object
    for (propertyName in object) {
        if (object.hasOwnProperty(propertyName) && isDefined(object[propertyName])) {
            return true;
        }
    }
    return false;
}
