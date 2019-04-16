"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var utf16_char_codes_1 = require("utf16-char-codes");
var splitByOpt;
(function (splitByOpt) {
    splitByOpt[splitByOpt["width"] = 0] = "width";
    splitByOpt[splitByOpt["word"] = 1] = "word";
    splitByOpt[splitByOpt["line"] = 2] = "line";
})(splitByOpt = exports.splitByOpt || (exports.splitByOpt = {}));
var lnEndOpt;
(function (lnEndOpt) {
    lnEndOpt[lnEndOpt["none"] = 0] = "none";
    lnEndOpt[lnEndOpt["noLnBr"] = 1] = "noLnBr";
    lnEndOpt[lnEndOpt["encode"] = 2] = "encode";
})(lnEndOpt = exports.lnEndOpt || (exports.lnEndOpt = {}));
var widthFlags;
(function (widthFlags) {
    widthFlags[widthFlags["none"] = 0] = "none";
    widthFlags[widthFlags["fullwidth"] = 1] = "fullwidth";
    widthFlags[widthFlags["surrogatePair"] = 2] = "surrogatePair";
})(widthFlags = exports.widthFlags || (exports.widthFlags = {}));
exports.stringBreaker = function (str, opt) {
    if (typeof str !== 'string') {
        throw new TypeError('stringBreaker: str parmeter must be of type string');
    }
    var options = getOptions({
        width: 80,
        lnEnd: lnEndOpt.noLnBr,
        noExSp: false,
        noBOM: true,
        lenOpt: widthFlags.none,
        splitOpt: splitByOpt.width
    }, opt);
    if (options.splitOpt === splitByOpt.width) {
        switch (options.lnEnd) {
            case lnEndOpt.encode:
                str = encodeLnBr(str);
                break;
            case lnEndOpt.noLnBr:
                str = removeLnBr(str);
                break;
            default:
                break;
        }
    }
    var result;
    if (options.noExSp === true) {
        str = removeExSp(str);
    }
    switch (options.splitOpt) {
        case splitByOpt.word:
            result = breakStrByEolWord(str, options);
            break;
        case splitByOpt.line:
            result = breakStrByEolWord(str, options);
            break;
        default:
            result = breakStrByCodePoint(str, options);
            break;
    }
    return result;
};
var getOptions = function (defaultOptions, options) {
    if (options === null || options === undefined ||
        typeof options === 'function') {
        return defaultOptions;
    }
    if (typeof options === 'number') {
        defaultOptions = __assign({}, defaultOptions);
        defaultOptions.width = options;
        options = defaultOptions;
    }
    if (options.width === undefined) {
        options.width = 80;
    }
    if (options.lnEnd === undefined) {
        options.lnEnd = lnEndOpt.noLnBr;
    }
    if (options.noExSp === undefined) {
        options.noExSp = false;
    }
    if (options.noBOM === undefined) {
        options.noBOM = true;
    }
    if (options.lenOpt === undefined) {
        options.lenOpt = widthFlags.none;
    }
    if (options.splitOpt === undefined) {
        options.splitOpt = splitByOpt.width;
    }
    return options;
};
var breakStrByEolWord = function (str, opt) {
    var results = [];
    if (str.length === 0) {
        return results;
    }
    var noBom = false;
    if (opt.noBOM === true) {
        noBom = true;
    }
    if (noBom === true) {
        var cp = Number(str.codePointAt(0));
        if (isBom(cp) === true) {
            str = str.substr(1);
            if (str.length === 0) {
                return results;
            }
        }
    }
    str = cleanLnBr(str); 
    if (opt.splitOpt === splitByOpt.word) {
        str = whiteSpToSp(str); 
        str = str.trim();
        if (str.length === 0) {
            return results; 
        }
        results = str.split(' ');
    }
    else {
        if (str.length === 0) {
            return results; 
        }
        results = str.split(/\n/);
    }
    return results;
};
var breakStrByCodePoint = function (str, opt) {
    var maxWidth = Math.round(Number(opt.width)); 
    if (maxWidth < 1) {
        throw new RangeError('stringBreaker: Width must be greater than zero');
    }
    var lines = [];
    var ln = [];
    var noBom = false;
    var respectWidth = false;
    var respectSurrogagePair = false;
    if (opt.lenOpt !== undefined) {
        var fullMask = 3; 
        if (opt.lenOpt < widthFlags.none || opt.lenOpt > fullMask) {
            throw new RangeError("stringBreaker: widthflags enum out of range. Expected value to be from " + widthFlags.none + " to " + fullMask);
        }
        if ((opt.lenOpt & widthFlags.fullwidth) === widthFlags.fullwidth) {
            respectWidth = true;
        }
        if ((opt.lenOpt & widthFlags.surrogatePair) === widthFlags.surrogatePair) {
            respectSurrogagePair = true;
        }
    }
    if (opt.noBOM === true) {
        noBom = true;
    }
    var width = 0;
    for (var i = 0; i < str.length; i++) {
        var code = str.codePointAt(i);
        if (code === undefined) {
            throw new Error("stringBreaker Error: No code point exist in first parameter str at postion " + i);
        }
        var cp = Number(code);
        var char = String.fromCodePoint(cp);
        if (i === 0) {
            if (noBom === true) {
                if (isBom(cp) === true) {
                    continue;
                }
            }
            else {
                if (isBom(cp) === true) {
                    ln.push(char);
                    continue;
                }
            }
        }
        if (isSurrogatePair(cp) === true) {
            i++;
        }
        width++;
        if (respectWidth === true && utf16_char_codes_1.codePointFullWidth(cp) === true) {
            width++;
        }
        if (respectSurrogagePair === true && isSurrogatePair(cp) === true) {
            width++;
        }
        ln.push(char);
        if (width >= maxWidth) {
            lines.push(ln.join(''));
            ln = [];
            width = 0;
        }
    }
    if (ln.length > 0) {
        lines.push(ln.join(''));
        ln = [];
    }
    return lines;
};
var removeLnBr = function (str) {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/(\r\n|\n|\r)/gm, '');
};
var whiteSpToSp = function (str) {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/\s+/gm, ' ');
};
var cleanLnBr = function (str) {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/(\r\n|\r)/gm, '\n');
};
var removeExSp = function (str) {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/\x20\x20+/g, ' ');
};
var encodeLnBr = function (str) {
    return str.replace(/(\r\n|\n|\r)/gm, '\\n');
};
var isSurrogatePair = function (cp) {
    if (cp >= 0x10000) {
        return true;
    }
    return false;
};
var isBom = function (cp) {
    if (cp === 0xFEFF 
        || cp === 0xFFFE 
        || cp === 0xEFBBBF 
        || cp === 0x2B2F76382D 
        || cp === 0x2B2F7638 
        || cp === 0x2B2F7639 
        || cp === 0x2B2F7626 
    ) {
        return true;
    }
    return false;
};
