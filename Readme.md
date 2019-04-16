<p align="center">
«-(¯`v´¯)-« <a href="https://www.npmjs.com/package/string-breaker">【🇸​🇹​🇷​🇮​🇳​🇬​-🇧​🇷​🇪​🇦​🇰​🇪​🇷​​】</a> »-(¯`v´¯)-»
</ br>
</p>
<p align="center">
<a href="https://travis-ci.org/Amourspirit/node-string-breaker"><img src="https://travis-ci.org/Amourspirit/node-string-breaker.svg?branch=master" /></a>
<a href="https://snyk.io/test/github/Amourspirit/node-string-breaker?targetFile=package.json">
<img src="https://snyk.io/test/github/Amourspirit/node-string-breaker/badge.svg?targetFile=package.json" /></a>
<a href="https://www.npmjs.com/package/string-breaker"><img alt="node" src="https://img.shields.io/node/v/string-breaker.svg"></a>
<img src="https://img.shields.io/github/package-json/v/Amourspirit/node-string-breaker.svg" />
<img src="https://img.shields.io/github/license/Amourspirit/node-string-breaker.svg" />
<a href="https://github.com/badges/stability-badges"> <img src="https://badges.github.io/stability-badges/dist/stable.svg" /></a>
</p>

# string-breaker

## Break string into array

* string array with elements that are a specific width
* string array with elements for each line
* string array with element fo reach word

## Documentation

For more information view the [Documentation](https://amourspirit.github.io/node-string-breaker/index.html)

### Install

```bash
npm install --save string-breaker
```

### Usage

```ts
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

console.log(x.join('\n'));
// 😇Hello
// World
// \nNice
// 😇\nhm
// m...

x = stringBreaker('\uD83D\uDE07Hello World\nNice 😇\nhmm...', {
    width: 6,
    lnEnd: lnEndOpt.none
    });
// x => [ '😇Hello', ' World', '\nNice ', '😇\nhmm.', '..' ]
console.log(x.join('\n'));
// 😇Hello
// World
//
// Nice 
// 😇
// hmm.
// ..

// replace all extra space with a single space
x = stringBreaker('\uD83D\uDE07    Hello     World\nNice    😇 \r\nhmm...', {
    width: 5,
    noExSp: true
    });
// x => ['😇 Hel', 'lo Wo', 'rldNi', 'ce 😇h', 'mm...']
```

Split by End of Line  
**stringBreaker** can split by eol by setting option *splitOpt: splitByOpt.line*

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

Split by Words
**stringBreaker** can split into words by setting option *splitOpt: splitByOpt.word*

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

**stringBreaker** by default will use code points to build output; however, this can be switched to character length by setting [lenOpt](https://amourspirit.github.io/node-string-breaker/enums/_main_.lnendopt.html) of [stringBreaker](https://amourspirit.github.io/node-string-breaker/modules/_main_.html#stringbreaker) [options](https://amourspirit.github.io/node-string-breaker/interfaces/_main_.istringbreakopt.html).

With options is set to [fullwitdh](https://amourspirit.github.io/node-string-breaker/enums/_main_.widthflags.html#fullwidth) the output is built based upon if the code point for each char that is [fullwidth](https://amourspirit.github.io/node-string-breaker/enums/_main_.widthflags.html#fullwidth) will take two positions.

```typescript
import { stringBreaker } from 'string-breaker';

let str = '!可以看到他的棕色腹部';
let x = stringBreaker(str, 6);
// x => [ '!可以看到他', '的棕色腹部' ]

x = stringBreaker(str , {
  width: 6,
  lenOpt: widthFlags.fullwidth
});
// all but the first char is a fullwidth
// x => [
//      '!可以看', // \u21 \u53EF \u4EE5 \u770B
//      '到他的',  // \u5230 \u4ED6 \u7684
//      '棕色腹',  // \u68D5 \u8272 \u8179
//      '部'      // \u90E8
//      ]

```

With [options](https://amourspirit.github.io/node-string-breaker/interfaces/_main_.istringbreakopt.html) is set to [surrogatePair](https://amourspirit.github.io/node-string-breaker/enums/_main_.widthflags.html#surrogatepair) the output is built based upon if the code point for each char that is **surrogate pair** will take two positions.

```typescript
import { stringBreaker } from 'string-breaker';

let str = '🧀😊😀😃😄😁';
console.log(str.length); // 12 all surrogate pairs

let x = stringBreaker(str, 3);
// x => [ '🧀😊😀', '😃😄😁' ]

x = stringBreaker(str , {
  width: 5,
  lenOpt: widthFlags.surrogatePair
});
// all the characters are surrogate pair
// because widthFlags.surrogatePair is set the output
// string array returns 6 not 5 due to surrogate pairs not breakable.
// x => [
//               { surrogate } | { surrogate } | { surrogate }
//  '🧀😊😀', //  \uD83E \uDDC0 | \uD83D \uDE0A | \uD83D \uDE00
//  '😃😄😁'  //  \uD83D \uDE03 | \uD83D \uDE04 | \uD83D \uDE01
//  ]

```

[widthFlags](https://amourspirit.github.io/node-string-breaker/enums/_main_.widthflags.html) can be set to combine options

```typescript
import { stringBreaker } from 'string-breaker';

let str = '🧀😊😀棕腹部!!';
console.log(str.length); // 11 mix of surrogate pair, halfwidth and fullwidth

let x = stringBreaker(str, 4);
// x => [ '🧀😊😀棕', '腹部!!' ]

x = stringBreaker(str , {
  width: 4,
  lenOpt: widthFlags.fullwidth | widthFlags.surrogatePair
});
// mix of surrogate pair, fullwidth and halfwidth
// x => [
// '🧀😊', // \uD83E \uDDC0 \uD83D \uDE0A two surrogate
// '😀棕', // \uD83D \uDE00 \u68D5 one surrogate and one fullwidth
// '腹部', // \u8179 \u90E8 two fullwidth
// '!!'  // \u21 \u21 two halfwidth
// ]
```
