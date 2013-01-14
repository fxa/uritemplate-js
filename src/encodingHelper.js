/*jshint unused: false */
/*global rfcCharHelper, pctEncoder*/
var encodingHelper = (function () {
    "use strict";

    function encode(text, passReserved) {
        var
            result = '',
            index,
            chr = '';
        if (typeof text === "number" || typeof text === "boolean") {
            text = text.toString();
        }
        for (index = 0; index < text.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(text, index);
            if (chr.length > 1) {
                result += chr;
            }
            else {
                result += rfcCharHelper.isUnreserved(chr) || (passReserved && rfcCharHelper.isReserved(chr)) ? chr : pctEncoder.encodeCharacter(chr);
            }
        }
        return result;
    }

    function encodePassReserved(text) {
        return encode(text, true);
    }

    return {
        encode: encode,
        encodePassReserved: encodePassReserved
    };

}());
