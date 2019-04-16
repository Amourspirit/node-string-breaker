import { codePointFullWidth } from 'utf16-char-codes';
// #region enums
/**
 * Line ending options
 */
export enum lnEndOpt {
  /** Take no action */
  none,
  /** Remove Line Break */
  noLnBr,
  /** Encode line breaks as \\n */
  encode
}

/**
 * Flags for Width output options
 * @example
```typescript

let wFlags = widthFlags.fullwidth | widthFlags.surrogatePair;
```
* @see {@link IStringBreakOpt}
*/
export enum widthFlags {
  /**
   * No options will be applied
   */
  none =  0,
  /**
   * Fullwidth chars will count for two positions
   */
  fullwidth = 1 << 0,
  /**
   * Surrogae Pairs will count for two positions
   */
  surrogatePair = 1 << 1
}
// #endregion

// #region interfaces
/**
 * @property width Width to break string at.
 * Default 80.
 * See: {@link IStringBreakOpt.width}
 * @property lnEnd Options for line endings
 * Type of {@link lnEndOpt}  
 * See: {@link IStringBreakOpt.lnEnd}
 * @property noExSp If true extra spaces will be removed from the output.
 * Default false.  
 * See: {@link IStringBreakOpt.noExSp}
 * @property noBOM Determins if BOM will be part of the output if it exist.
 * If false BOM will be included.  
 * Default true.  
 * See: {@link IStringBreakOpt.noBOM}
 * @property lenOpt Flags for Width output options of type
 * Type of {@link widthFlags}  
 * See: {@link IStringBreakOpt.noBOM}
 * @see {@link stringBreaker}
 */
 export interface IStringBreakOpt {
  /**
   * Width to break string at.  
   * Default 80
   */
  width?: number;
  /**
   * Options for line endings
   */
  lnEnd?: lnEndOpt;
  /**
   * If true extra spaces will be removed from the output.  
   * Default false
   */
  noExSp?: boolean;
  /**
   * If false and input string has BOM then the BOM will be added as the first byte of output.  
   * BOM will not be counted in the width of the first line.  
   * If false the return value will not have BOM included.  
   * Default true
   */
  noBOM?: boolean;
  /**
   * Flags for Width output options
   */
   lenOpt?: widthFlags;
}
// #endregion

// #region export methods
/**
 * Breaks a string into a string array
 * @param str The string to break into string array
 * @param opt parameters to affect the output.  
 * Can be number or {@link IStringBreakOpt}  
 * If a number is passed in it becomes the width for the output.
 *
 * Example:
```typescript
import { stringBreaker } from 'string-breaker';

let x = stringBreaker('The quick brown fox jumped over the lazy dog', 5);
// x => ['The q','uick ','brown',' fox ','jumpe','d ove','r the',' lazy',' dog']

x = stringBreaker('Hello World\nNice 😇\nhmm... ', 5);
// x => ['Hello', ' Worl', 'dNice', ' 😇hmm', '... ']

x = stringBreaker('\uD83D\uDE07Hello World\nNice 😇\nhmm...', 6);
// x => ['😇Hello', ' World', 'Nice 😇', 'hmm...']

x = stringBreaker('\uD83D\uDE07Hello World\nNice 😇\r\nhmm...', {
    width: 6,
    lnEnd: lnEndOpt.encode
    });
// x => ['😇Hello', ' World', '\\nNice', ' 😇\\nhm', 'm...']
```
 */
export const stringBreaker = (str: string, opt?: IStringBreakOpt | number): string[] => {
  const options: IStringBreakOpt = getOptions({
    width: 80,
    lnEnd: lnEndOpt.noLnBr,
    noExSp: false,
    noBOM: true,
    lenOpt: widthFlags.none
  }, opt);
  switch (options.lnEnd) {
    case lnEndOpt.encode:
      str = encodeLnBr(str);
      break;
    case lnEndOpt.noLnBr:
      str = removeLnBr(str);
      break
    default:
      break;
  }
  if (options.noExSp === true) {
    str = removeExSp(str);
  }
  /* if (options.byCodePoint === false) {
    return breakStr(str, options);  
  } */
  return breakStrByCodePoint(str, options);
}
// #endregion

// #region internal methods
/**
 * @hidden
 * Gets the options for the string break
 * @param defaultOptions options to return if options is undefined
 * @param options options to apply
 */
const getOptions = (defaultOptions: IStringBreakOpt, options?: IStringBreakOpt | number): IStringBreakOpt => {
  if (options === null || options === undefined ||
    typeof options === 'function') {
    return defaultOptions;
  }

  if (typeof options === 'number') {
    defaultOptions = { ...defaultOptions };
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
  return options;
}
/**
 * @hidden
 */
const breakStrByCodePoint = (str: string, opt: IStringBreakOpt): string[] => {
  const maxWidth: number = Math.round(Number(opt.width)); // make sure it int
  if (maxWidth < 1) {
    throw new RangeError('stringBreaker: Width must be greater than zero');
  }
  const lines: string[] = [];
  let ln: string[] = [];
  let noBom: boolean = false;
  let respectWidth: boolean = false;
  let respectSurrogagePair = false;
  if (opt.lenOpt !== undefined) {
    // enums can be assigned any arbitrary number
    const fullMask = 3; // widthFlags.fullwidth | widthFlags.surrogatePair
    if (opt.lenOpt < widthFlags.none || opt.lenOpt > fullMask) {
      throw new RangeError(`stringBreaker: widthflags enum out of range. Expected value to be from ${widthFlags.none} to ${fullMask}`);
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
  let width: number = 0;
  for (let i = 0; i < str.length; i++) {
    
    const code = str.codePointAt(i);
    if (code === undefined) {
      // in typescript this should never happen
      throw new Error(`stringBreaker Error: No code point exist in first parameter str at postion ${i}`);
    }
    const cp = Number(code);
    const char = String.fromCodePoint(cp);
    if (i === 0) {
      if (noBom === true) {
        if (isBom(cp) === true) {
          continue;
        }
      } else {
        if (isBom(cp) === true) {
          ln.push(char);
          continue;
        }
      }
    }
    // surrogate pair
    if (isSurrogatePair(cp) === true) {
      i++;
    }
    width++;
    if (respectWidth === true && codePointFullWidth(cp) === true) {
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
  // pickup the remainder of the chars
  if (ln.length > 0) {
    lines.push(ln.join(''));
    ln = [];
  }
  return lines;
}
/**
 * @hidden
 */
const removeLnBr = (str: string): string => {
  if (str.length === 0) {
    return '';
  }
  // This replaces all instance of the \r\n then replaces all \n then finally
  // replaces all \r. It goes through and removes all types of line breaks
  return str.replace(/(\r\n|\n|\r)/gm, '');
}
/**
 * @hidden
 */
const removeExSp = (str: string): string => {
  if (str.length === 0) {
    return '';
  }
  // matches 2 or more spaces
  return str.replace(/\x20\x20+/g, ' ');
}
/**
 * @hidden
 */
const encodeLnBr = (str: string): string => {
  return str.replace(/(\r\n|\n|\r)/gm, '\\n');
}
/**
 * @hidden
 */
const isSurrogatePair = (cp: number): boolean => {
  if (cp >= 0x10000) {
    return true;
  }
  return false;
}
// https://unicodebook.readthedocs.io/unicode_encodings.html
// // UTF-8 including a BOM is not needed and discouraged
/**
 * @hidden
 */
const isBom = (cp: number): boolean => {
  if (
    cp === 0xFEFF // UTF-16-BE
    || cp === 0xFFFE // UTF-16-LE
    || cp === 0xEFBBBF // UTF-8 endianless
    || cp === 0x2B2F76382D // UTF-7 endianless +/v8-
    || cp === 0x2B2F7638 // UTF-7 +/v8
    || cp === 0x2B2F7639 // UTF-7 +/v9
    || cp === 0x2B2F7626 // UTF-7 +/v+
    ) {
    return true;
  }
  return false;
}
// #endregion