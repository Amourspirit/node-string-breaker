/**
 * Line ending options
 */
export declare enum lnEndOpt {
    /** Take no action */
    none = 0,
    /** Remove Line Break */
    noLnBr = 1,
    /** Encode line breaks as \\n */
    encode = 2
}
/**
 * Flags for Width output options
 * @example
```typescript

let wFlags = widthFlags.fullwidth | widthFlags.surrogatePair;
```
* @see {@link IStringBreakOpt}
*/
export declare enum widthFlags {
    /**
     * No options will be applied
     */
    none = 0,
    /**
     * Fullwidth chars will count for two positions
     */
    fullwidth = 1,
    /**
     * Surrogae Pairs will count for two positions
     */
    surrogatePair = 2
}
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
export declare const stringBreaker: (str: string, opt?: number | IStringBreakOpt | undefined) => string[];
