/*jshint unused: false */
/*global rfcCharHelper, pctEncoder*/
/**
 * encoding of rfc 6570
 */
var encodingHelper = (function () {
    "use strict";

    function encode (text, passReserved) {
        var
            result = '',
            index,
            chr = '';
        if (typeof text === "number" || typeof text === "boolean") {
            text = text.toString();
        }
        for (index = 0; index < text.length; index += chr.length) {
            chr = text.charAt(index);
            result += rfcCharHelper.isUnreserved(chr) || (passReserved && rfcCharHelper.isReserved(chr)) ? chr : pctEncoder.encodeCharacter(chr);
        }
        return result;
    }

    function encodePassReserved (text) {
        return encode(text, true);
    }

    return {
        encode: encode,
        encodePassReserved: encodePassReserved
    };

}());
