/*jshint unused:false */
/*global unescape, charHelper*/
var pctEncoder = (function () {
    "use strict";

    // see http://ecmanaut.blogspot.de/2006/07/encoding-decoding-utf8-in-javascript.html
    function toUtf8(s) {
        return unescape(encodeURIComponent(s));
    }

    function encode(chr) {
        var
            result = '',
            octets = toUtf8(chr),
            octet,
            index;
        for (index = 0; index < octets.length; index += 1) {
            octet = octets.charCodeAt(index);
            result += '%' + octet.toString(16).toUpperCase();
        }
        return result;
    }

    function isPctEncoded(chr) {
        if (chr.length < 3) {
            return false;
        }
        for (var index = 0; index < chr.length; index += 3) {
            if (chr.charAt(index) !== '%' || !charHelper.isHexDigit(chr.charAt(index + 1) || !charHelper.isHexDigit(chr.charAt(index + 2)))) {
                return false;
            }
        }
        return true;
    }

    function pctCharAt(text, startIndex) {
        var chr = text.charAt(startIndex);
        if (chr !== '%') {
            return chr;
        }
        chr = text.substr(startIndex, 3);
        if (!isPctEncoded(chr)) {
            return '%';
        }
        return chr;
    }

    return {
        encodeCharacter: encode,
        decodeCharacter: decodeURIComponent,
        isPctEncoded: isPctEncoded,
        pctCharAt: pctCharAt
    };
}());
