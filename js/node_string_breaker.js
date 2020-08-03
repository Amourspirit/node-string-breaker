import { codePointFullWidth } from 'https://cdn.jsdelivr.net/gh/Amourspirit/node-utf16-char-codes@0ce6dad4c70cbb65b11b15e64ec4648ec5a02095/js/node_utf16_char_codes.min.js';
export var splitByOpt;
(function (splitByOpt) {
    splitByOpt[splitByOpt["width"] = 0] = "width";
    splitByOpt[splitByOpt["word"] = 1] = "word";
    splitByOpt[splitByOpt["line"] = 2] = "line";
})(splitByOpt || (splitByOpt = {}));
export var lnEndOpt;
(function (lnEndOpt) {
    lnEndOpt[lnEndOpt["none"] = 0] = "none";
    lnEndOpt[lnEndOpt["noLnBr"] = 1] = "noLnBr";
    lnEndOpt[lnEndOpt["encode"] = 2] = "encode";
})(lnEndOpt || (lnEndOpt = {}));
export var widthFlags;
(function (widthFlags) {
    widthFlags[widthFlags["none"] = 0] = "none";
    widthFlags[widthFlags["fullwidth"] = 1] = "fullwidth";
    widthFlags[widthFlags["surrogatePair"] = 2] = "surrogatePair";
    widthFlags[widthFlags["nearestWord"] = 4] = "nearestWord";
})(widthFlags || (widthFlags = {}));
export const stringBreaker = (str, opt) => {
    if (typeof str !== 'string') {
        throw new TypeError('stringBreaker: str parmeter must be of type string');
    }
    const options = getOptions({
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
    let result;
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
const getOptions = (defaultOptions, options) => {
    if (options === null || options === undefined ||
        typeof options === 'function') {
        return defaultOptions;
    }
    if (typeof options === 'number') {
        defaultOptions = Object.assign({}, defaultOptions);
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
const breakStrByEolWord = (str, opt) => {
    let results = [];
    if (str.length === 0) {
        return results;
    }
    let noBom = false;
    if (opt.noBOM === true) {
        noBom = true;
    }
    if (noBom === true) {
        const cp = Number(str.codePointAt(0));
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
const breakStrByCodePoint = (str, opt) => {
    const maxWidth = Math.round(Number(opt.width));
    if (maxWidth < 1) {
        throw new RangeError('stringBreaker: Width must be greater than zero');
    }
    const lines = [];
    let ln = [];
    let noBom = false;
    let respectWidth = false;
    let respectSurrogagePair = false;
    let respectNearstWord = false;
    if (opt.lenOpt !== undefined) {
        const fullMask = 7;
        if (opt.lenOpt < widthFlags.none || opt.lenOpt > fullMask) {
            throw new RangeError(`stringBreaker: widthflags enum out of range. Expected value to be from ${widthFlags.none} to ${fullMask}`);
        }
        if ((opt.lenOpt & widthFlags.fullwidth) === widthFlags.fullwidth) {
            respectWidth = true;
        }
        if ((opt.lenOpt & widthFlags.surrogatePair) === widthFlags.surrogatePair) {
            respectSurrogagePair = true;
        }
        if ((opt.lenOpt & widthFlags.nearestWord) === widthFlags.nearestWord) {
            respectNearstWord = true;
        }
    }
    if (opt.noBOM === true) {
        noBom = true;
    }
    let width = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.codePointAt(i);
        if (code === undefined) {
            throw new Error(`stringBreaker Error: No code point exist in first parameter str at postion ${i}`);
        }
        const cp = Number(code);
        const char = String.fromCodePoint(cp);
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
        if (respectNearstWord === true && ln.length === 0) {
            if (isWhiteSpace(cp) === true && isPrintableWhiteSpace(cp) === false) {
                continue;
            }
        }
        width++;
        if (respectWidth === true && codePointFullWidth(cp) === true) {
            width++;
        }
        if (respectSurrogagePair === true && isSurrogatePair(cp) === true) {
            width++;
        }
        if (respectNearstWord === true) {
            if (isWhiteSpace(cp) === false) {
                ln.push(char);
                continue;
            }
            else {
                if (isNonBreakSpace(cp) === true) {
                    ln.push(char);
                    continue;
                }
                if (isPrintableWhiteSpace(cp) === true) {
                    ln.push(char);
                }
                else if (width < maxWidth) {
                    ln.push(char);
                }
            }
        }
        else {
            ln.push(char);
        }
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
const isZSpace = (num) => {
    const z = [
        0x0020,
        0x00A0,
        0x1680,
        0x202F,
        0x205F,
        0x3000
    ];
    if (z.indexOf(num) !== -1) {
        return true;
    }
    if (num >= 0x2000 && num <= 0x200A) {
        return true;
    }
    return false;
};
const isWhiteSpace = (num) => {
    const w = [
        0x0085,
        0x2029
    ];
    if (w.indexOf(num) !== -1) {
        return true;
    }
    if (num >= 0x0009 && num <= 0x000D) {
        return true;
    }
    if (isZSpace(num) === true) {
        return true;
    }
    return false;
};
const isNonBreakSpace = (num) => {
    if (num === 0x00A0 || num === 0x202F) {
        return true;
    }
    return false;
};
const isPrintableWhiteSpace = (num) => {
    if (num === 0x1680) {
        return true;
    }
    return false;
};
const removeLnBr = (str) => {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/(\r\n|\n|\r)/gm, '');
};
const whiteSpToSp = (str) => {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/\s+/gm, ' ');
};
const cleanLnBr = (str) => {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/(\r\n|\r)/gm, '\n');
};
const removeExSp = (str) => {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/\x20\x20+/g, ' ');
};
const encodeLnBr = (str) => {
    return str.replace(/(\r\n|\n|\r)/gm, '\\n');
};
const isSurrogatePair = (cp) => {
    if (cp >= 0x10000) {
        return true;
    }
    return false;
};
const isBom = (cp) => {
    if (cp === 0xFEFF
        || cp === 0xFFFE
        || cp === 0xEFBBBF
        || cp === 0x2B2F76382D
        || cp === 0x2B2F7638
        || cp === 0x2B2F7639
        || cp === 0x2B2F7626) {
        return true;
    }
    return false;
};
