import { codePointFullWidth } from 'utf16-char-codes';
// #region enums
/**
 * Split string kind
 */
export enum splitByOpt {
  /** Split by Width */
  width,
  /**
   * Split by word  
   * Defult
   */
  word,
  /** Split by line */
  line
}
/**
 * Line ending options
 */
export enum lnEndOpt {
  /** Take no action */
  none,
  /**
   * Remove Line Break  
   * Default
   * */
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
   * @see {@link https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms}
   */
  fullwidth = 1 << 0,
  /**
   * Surrogae Pairs will count for two positions
   * @see {@link https://en.wikipedia.org/wiki/UTF-16}
   */
  surrogatePair = 1 << 1
}
// #endregion

// #region interfaces
/**
 * Options for {@link stringBreaker}
 * 
 * Example to split string contains elemets of 10
```typescript
const opt: IStringBreakOpt = { width: 10 }
```
 *
 * Example to split string contains elemets of 40
 * and encode line endings into \n
```typescript
 * const opt: IStringBreakOpt = {
 *   width: 40,
 *   lnEnd: lnEndOpt.encode
 *  }
```
 *
 * Example to split string contains elemets of 40
 * and keep Byte order mark if it exist
```typescript
 * const opt: IStringBreakOpt = {
 *   width: 40,
 *   noBOM: false
 *  }
```
 *
 * Example to split string contains one element per line
```typescript
const opt: IStringBreakOpt = { splitOpt: splitByOpt.line }
```
 *
 * Example to split string contains one element per word
```typescript
const opt: IStringBreakOpt = { splitOpt: splitByOpt.word }
```
 *
 * Example to split string contains elemets base up if the
 * character is fullwidth or halfwidth.
 * 
 * Fullwidth chars would take up two positions in the element.
 * 
 * Halfwidth chars would take up one postion in the element.
```typescript
 * const opt: IStringBreakOpt = {
 *   width: 40,
 *   lenOpt: widthFlags.fullwidth
 *  }
```
 *
 * Example to split string contains elemets base up if the
 * character is a surrogate pair.
 *
 * Surrogate pair chars would take up two positions in the element.
```typescript
 * const opt: IStringBreakOpt = {
 *   width: 40,
 *   lenOpt: widthFlags.surrogatePair
 *  }
```
 *
 * Example to split string contains elemets base up if the
 * character is fullwidth, halfwidth or surrogate pair.
 *
 * Fullwidth chars would take up two positions in the element.
 *
 * Halfwidth chars would take up one postion in the element.
 * 
 * Surrogate pair chars would take up two positions in the element.
```typescript
 * const opt: IStringBreakOpt = {
 *   width: 100,
 *   lenOpt: widthFlags.fullwidth | widthFlags.surrogatePair
 *  }
```
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
   /**
    * Option to break string.  
    * Width, word, eol
    */
   splitOpt?: splitByOpt;
}
// #endregion

// #region export methods
/**
 * Breaks a string into a string array
 * @param str The string to break into string array
 * @param opt parameters to affect the output.  
 * Can be number or {@link IStringBreakOpt}  
 * If a number is passed in it becomes the width for the output.  
 * If no parameter is passed then output will be broken into string array
 * with 80 characters per element.
 * 
 ```typescript
let x: string[];
x = stringBreaker('some long text');
// is the same as
x = stringBreaker('some long text', 80),
// is the same as
x = stringBreaker('some long text' {width: 80});
 ```
 * 
 * Example:
 ```typescript
 *
 * import { stringBreaker } from 'string-breaker';
 *
 * let x = stringBreaker('The quick brown fox jumped over the lazy dog', 5);
 * // x => ['The q','uick ','brown',' fox ','jumpe','d ove','r the',' lazy',' dog']
 * 
 * x = stringBreaker('Hello World\nNice 😇\nhmm... ', 5);
 * // x => ['Hello', ' Worl', 'dNice', ' 😇hmm', '... ']
 * 
 * x = stringBreaker('\uD83D\uDE07Hello World\nNice 😇\nhmm...', 6);
 * // x => ['😇Hello', ' World', 'Nice 😇', 'hmm...']
 * 
 * x = stringBreaker('\uD83D\uDE07Hello World\nNice 😇\r\nhmm...', {
 *     width: 6,
 *     lnEnd: lnEndOpt.encode
 *     });
 * // x => ['😇Hello', ' World', '\\nNice', ' 😇\\nhm', 'm...']
 ```
 *
 * Split by End of Line  
 * stringBreaker can split by eol by setting option lnEnd: lnEndOpt.splitByEol
 * 
 * Example Splitting by End of Line:
```typescript
import { stringBreaker } from 'string-breaker';

// mixing \n and \r will result in the same output
let strSrc = 'Happy cat.';
strSrc += '\nThe quick brown fox jumped over the lazy dog.';
strSrc += '\r\nThe moon is full tonight.\rI like full moons!';

const x = stringBreaker(strSrc, { splitOpt: splitByOpt.line });
// x => [
//  'Happy cat.',
//  'The quick brown fox jumped over the lazy dog.',
//  'The moon is full tonight.',
//  'I like full moons!' ]
```
 * 
 * Example splitting by Word:
```typescript
import { stringBreaker } from 'string-breaker';

// mixing \n and \r will result in the same output
let strSrc = 'Happy cat.';
strSrc += '\nThe quick   brown\t\t fox jumped over the lazy dog.';
strSrc += '\r\nThe moon is full tonight.\rI like full moons!';

const x = stringBreaker(strSrc, { splitOpt: splitByOpt.word });
// x => [ 'Happy','cat.','The','quick','brown','fox','jumped',
//        'over','the','lazy','dog.','The','moon','is','full',
//        'tonight.','I','like','full','moons!' ]

```
 */
export const stringBreaker = (str: string, opt?: IStringBreakOpt | number): string[] => {
  if (typeof str !== 'string') {
    throw new TypeError('stringBreaker: str parmeter must be of type string');
  }
  const options: IStringBreakOpt = getOptions({
    width: 80,
    lnEnd: lnEndOpt.noLnBr,
    noExSp: false,
    noBOM: true,
    lenOpt: widthFlags.none,
    splitOpt: splitByOpt.width
  }, opt);

  // only remove or encode line beaks when splitting by width
  if (options.splitOpt === splitByOpt.width) {
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
  }
  let result: string[];
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
  if (options.splitOpt === undefined) {
    options.splitOpt = splitByOpt.width;
  }
  return options;
}
const breakStrByEolWord = (str: string, opt: IStringBreakOpt): string[] => {
  // eol has allready been cleaned at this point
  // all eol are \n
  let results: string[] = []
  if (str.length === 0) {
    // results.push('');
    return results;
  }
  let noBom: boolean = false;
  if (opt.noBOM === true) {
    noBom = true;
  }
  if (noBom === true) {
    const cp: number = Number(str.codePointAt(0));
    if (isBom(cp) === true) {
      str = str.substr(1);
      if (str.length === 0) {
        // results.push('');
        return results;
      }
    }
  }
  str = cleanLnBr(str); // clean the line breaks just in case irregular
  if (opt.splitOpt === splitByOpt.word) {
    // important to call clean white space after removing BOM
    // otherwise BOM would be converted to space.
    str = whiteSpToSp(str); // all whites sapce (tab, \n multi space) to single space
    str = str.trim();
    if (str.length === 0) {
      return results; // return empty array if empty string
    }
    // all extra spaces have been replace by
    // a single space at this point
    results = str.split(' ');  
  } else {
    if (str.length === 0) {
      return results; // return empty array if empty string
    }
    results = str.split(/\n/);
  }
  return results;
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
 * This replaces all instance of the \r\n then replaces all \n then finally
 * replaces all \r. It goes through and removes all types of line breaks
 * @param str String to replace line breaks in
 */
const removeLnBr = (str: string): string => {
  if (str.length === 0) {
    return '';
  }
  return str.replace(/(\r\n|\n|\r)/gm, '');
}
/**
 * @hidden
 * This replaces all instance of whitespace with a single space
 * @param str String to replace witespaces with space
 * 
 * BOM qualifys as whitespace. If the str has a BOM it will be
 * replaced by a single space
 */
const whiteSpToSp = (str: string): string => {
  if (str.length === 0) {
    return '';
  }
  // This replaces all instance of whitespace with a single space
  return str.replace(/\s+/gm, ' ');
}
/**
 * @hidden
 * This replaces all instance of the \r\n then replaces all \r.
 * It goes through and replaces all line breaks that are not strictly \n
 * @param str String to clean line breaks
 */
const cleanLnBr = (str: string): string => {
  if (str.length === 0) {
    return '';
  }
  return str.replace(/(\r\n|\r)/gm, '\n');
}
/**
 * @hidden
 * Replces two or spaces with a single space
 * @param str The string to repace in
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
 * Encodes linebreaks as \n
 * Any mix of \r \n becomes \n
 * @param str The string to repace in
 */
const encodeLnBr = (str: string): string => {
  return str.replace(/(\r\n|\n|\r)/gm, '\\n');
}
/**
 * @hidden
 * Checkes to see if a number represents a surrogate pair
 * @param cp the number to test representing a unicode code point
 * @returns true if cp is unicode surrogate pair; Otherwise, false
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
 * Checks to see if a number represents a byte order mark
 * @param cp the number to test
 * @returns true if cp matches BOM; Otherwise, false.
 * 
 * Supports UTF-8, UTF-16, UTF-7
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