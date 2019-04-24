import { expect } from 'chai';
import { stringBreaker, lnEndOpt, widthFlags, splitByOpt } from '../src/main';
import randomstring from 'randomstring';
import fs from 'fs';
import mkdirp = require('mkdirp');

const outDir = `${process.cwd()}/scratch/tests`;
const fixDir = `${process.cwd()}/tests/fixtures`;
const t1000 = `${fixDir}/t1000_lf.txt`;
// this next line only works in node v10.12 +
// see: https://nodejs.org/api/fs.html#fs_fs_mkdirsync_path_options
// fs.mkdirSync(`${process.cwd()}/scratch/test`, { recursive: true });
// #region functions
/* const getNodeMajor = (): number => {
  // https://www.regexpal.com/?fam=108819
  var s = process.version;
  var major = s.replace(/v?(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)/, '$1');
  return parseInt(major, 10);
}
const getNodeMinor = (): number => {
  // https://www.regexpal.com/?fam=108819
  var s = process.version;
  var major = s.replace(/v?(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)/, '$2');
  return parseInt(major, 10);
} */
// #endregion
// make scratch directory if needed
mkdirp.sync(outDir);

describe('String Breaker test', () => {
  it('should break a string with 100 chars and create a string array that has 10 elements', (done) => {
    const str: string = randomstring.generate({length: 100});
    let result = stringBreaker(str, { width: 10 });
    expect(result.length).equal(10);
    done();
  });
  it('should break a string with 100 chars and create a string array that each element being 10 chars', (done) => {
    const str: string = randomstring.generate({ length: 100 });
    let result = stringBreaker(str, { width: 10 });
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      expect(element.length).equal(10);
    }
    done();
  });
  it('should break a string with 1320 chars and create a string array that each element being 11 chars', (done) => {
    const str: string = randomstring.generate({ length: 1320 });
    let result = stringBreaker(str, { width: 11 });
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      expect(element.length).equal(11);
    }
    done();
  });
  it('should break a string f𝌆𝌆bar that contains surrogate pairs', (done) => {
    const str: string = "f𝌆𝌆bar";
    let result = stringBreaker(str, { width: 2 });
    // elements 0 and 1 shoud have a string length of 3 due containing a surrogate pair
    // elements 2 should have a length of 2
    expect(result.length).equal(3);
    expect(result.join('')).equal(str);
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      if (i > 1) {
        expect(element.length).equal(2);
      } else {
        expect(element.length).equal(3);
      }
      
    }
    done();
  });
  it('should read fixtrue t1000_lf.txt and break and encode the line ending as \\n.', (done) => {
    let strSrc: string = fs.readFileSync(`${fixDir}/t1000_lf.txt`, 'utf8');
    let result = stringBreaker(strSrc, { lnEnd: lnEndOpt.encode }); // no BOM utf-8
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/t1000_lf_80_encln.txt`, str, 'utf8');
    let src = fs.readFileSync(`${fixDir}/t1000_lf_80_encln.txt`);
    let dest = fs.readFileSync(`${outDir}/t1000_lf_80_encln.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
  it('should read fixture t1000_lf.txt break the lines into default width of 80 and match fixture t1000_lf_80.txt', (done) => {
    let strSrc: string = fs.readFileSync(t1000, 'utf8');
    let compare: string = fs.readFileSync(`${fixDir}/t1000_lf_80.txt`, 'utf8');
    let result = stringBreaker(strSrc);
    let str: string = result.join('\n');
    expect(compare).equal(str);
    done();
  });
  it('should read fixture t1000_crlf.txt break the lines into default width of 80 and match fixture t1000_crlf_80.txt', (done) => {
    let strSrc: string = fs.readFileSync(t1000, 'utf8');
    let compare: string = fs.readFileSync(`${fixDir}/t1000_crlf_80.txt`, 'utf8');
    let result = stringBreaker(strSrc);
    let str: string = result.join('\r\n');
    expect(compare).equal(str);
    done();
  });
  it('should read fixture t1000_lf.txt break the lines into width of 40 and match fixture t1000_lf_40.txt', (done) => {
    let src: string = fs.readFileSync(t1000, 'utf8');
    src = src.replace(/\n/g, '');
    let compare: string = fs.readFileSync(`${fixDir}/t1000_lf_40.txt`, 'utf8');
    let result = stringBreaker(src, { width: 40 });
    let str: string = result.join('\n');
    // fs.writeFileSync(`${outDir}/t1000_40.txt`, str, 'utf8');
    expect(compare).equal(str);
    done();
  });
  it('should read fixture utf16_en_lf.txt write a tmp file, that file should equal fixture utf16_en_lf_18.txt', (done) => {
    let strSrc: string = fs.readFileSync(`${fixDir}/utf16_en_lf.txt`, 'utf16le');
    let result = stringBreaker(strSrc, { width: 18, noBOM: false });
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/utf16_en_lf_18.txt`, str, 'utf16le');
    let src = fs.readFileSync(`${fixDir}/utf16_en_lf_18.txt`);
    let dest = fs.readFileSync(`${outDir}/utf16_en_lf_18.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
  it('should read fixture utf8_gbk_lf.txt write a tmp file, that file should equal fixture utf8_gbk_lf_45.txt', (done) => {
    let strSrc: string = fs.readFileSync(`${fixDir}/utf8_gbk_lf.txt`, 'utf16le');
    let result = stringBreaker(strSrc, { width: 45 }); // no BOM utf-8
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/utf8_gbk_lf_45.txt`, str, 'utf8');
    let src = fs.readFileSync(`${fixDir}/utf8_gbk_lf_45.txt`);
    let dest = fs.readFileSync(`${outDir}/utf8_gbk_lf_45.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
  it('should read fixture utf8_gbk_lf.txt write a tmp file with fullwidth and surrogatePair flags set, that file should equal fixture utf8_gbk_lf_45.txt', (done) => {
    let strSrc: string = fs.readFileSync(`${fixDir}/utf8_gbk_lf.txt`, 'utf16le');
    let result = stringBreaker(strSrc, {
      width: 76,
      lenOpt: widthFlags.fullwidth | widthFlags.surrogatePair
    });
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/utf8_gbk_lf_76.txt`, str, 'utf8');
    let src = fs.readFileSync(`${fixDir}/utf8_gbk_lf_76.txt`);
    let dest = fs.readFileSync(`${outDir}/utf8_gbk_lf_76.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
  it('should read fixture t1000_lf.txt write a tmp file with fullwidth and surrogatePair flags set, that file should equal fixture t1000_lf_62.txt', (done) => {
    let strSrc: string = fs.readFileSync(t1000, 'utf8');
    // lenOpt: lenOpt: widthFlags.fullwidth | widthFlags.surrogatePair
    let result = stringBreaker(strSrc, { width: 62, lenOpt: 3, noBOM: false });
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/t1000_lf_62.txt`, str, 'utf8');
    let src = fs.readFileSync(`${fixDir}/t1000_lf_62.txt`);
    let dest = fs.readFileSync(`${outDir}/t1000_lf_62.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
  it('should read fixture t1000_sp_lf.txt write a tmp file using noExSp true, that file should equal fixture t1000_lf_80.txt', (done) => {
    let strSrc: string = fs.readFileSync(`${fixDir}/t1000_sp_lf.txt`, 'utf8');
    let result = stringBreaker(strSrc, { noExSp: true }); // no BOM utf-8
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/t1000_sp_lf_80.txt`, str, 'utf8');
    let src = fs.readFileSync(`${fixDir}/t1000_lf_80.txt`);
    let dest = fs.readFileSync(`${outDir}/t1000_sp_lf_80.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
  it('should read fixture sp.txt write a tmp file, that file should equal fixture sp_6.txt', (done) => {
    let strSrc: string = fs.readFileSync(`${fixDir}/sp.txt`, 'utf8');
    let result = stringBreaker(strSrc, { width: 6, lenOpt: widthFlags.none});
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/sp_6.txt`, str, 'utf8');
    let src = fs.readFileSync(`${fixDir}/sp_6.txt`);
    let dest = fs.readFileSync(`${outDir}/sp_6.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
  it('should read fixture sp.txt write a tmp file with fullwidth and surrogatePair flags set, that file should equal fixture sp_10.txt', (done) => {
    let strSrc: string = fs.readFileSync(`${fixDir}/sp.txt`, 'utf8');
    let result = stringBreaker(strSrc, {
      width: 10,
      lenOpt: widthFlags.fullwidth | widthFlags.surrogatePair
    });
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/sp_10.txt`, str, 'utf8');
    let src = fs.readFileSync(`${fixDir}/sp_10.txt`);
    let dest = fs.readFileSync(`${outDir}/sp_10.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
  it('should throw a range error when lenOpt is out of enum mask range', (done) => {
    expect(() => {
        stringBreaker('abc', {
        width: 3,
        lenOpt: 100
      });
    }).to.throw(RangeError);
    done();
  });
  it('should throw a range error with width is less than one', (done) => {
    expect(() => {
      stringBreaker('abc', 0);
    }).to.throw(RangeError);
    done();
  });
  it('should break a string by line with BOM by eol and remove the BOM', (done) => {
    // include BOM and \n \r varations
    const strSrc = '\ufeff' + 'Happy cat.\nThe quick brown fox jumped over the lazy dog.\r\nThe moon is full tonight.\rI like full moons!';
    const result = stringBreaker(strSrc, {
      width: 10, // width will be ignored due to splitByOpt.line
      splitOpt: splitByOpt.line
    });
    expect(result.length).equal(4);
    expect(result[0]).equal('Happy cat.'); // BOM has been removed
    expect(result[1]).equal('The quick brown fox jumped over the lazy dog.');
    expect(result[2]).equal('The moon is full tonight.');
    expect(result[3]).equal('I like full moons!');
    done();
  });
  it('should break an empty string by line by eol and return 0 length string array', (done) => {
    const strSrc = '';
    const result = stringBreaker(strSrc, {
      splitOpt: splitByOpt.line
    });
    expect(result.length).equal(0);
    done();
  });
  it('should break 🧀😊😀😃😄😁\\n😃😄😁🧀😊😀 by line by eol and return 2 length string array', (done) => {
    const strSrc = '🧀😊😀😃😄😁\n😃😄😁🧀😊😀';
    const result = stringBreaker(strSrc, {
      splitOpt: splitByOpt.line
    });
    expect(result.length).equal(2);
    expect(result[0]).equal('🧀😊😀😃😄😁');
    expect(result[1]).equal('😃😄😁🧀😊😀');
    done();
  });
  it('should break a string by line with only a BOM by eol and return 0 length string array', (done) => {
    const strSrc = '\ufeff'; // Byte order mark
    const result = stringBreaker(strSrc, {
      splitOpt: splitByOpt.line
    });
    expect(result.length).equal(0);
    done();
  });
  /**
   * Test to check and see that breaking an empty string by end of line
   * results in a string array with a length of 0
   */
  it('should break a empty string by eol and return string array with zero elements', (done) => {
    const strSrc = '';
    const result = stringBreaker(strSrc, {
      splitOpt: splitByOpt.line
    });
    expect(result.length).equal(0);
    done();
  });
  it('should break a string into words with BOM and iregular line breaks by word and remove the BOM', (done) => {
    // include BOM and \n \r varations
    const strSrc = '\ufeff' + 'Happy cat.\nThe quick brown fox jumped over the lazy dog.\r\nThe moon is full tonight.\rI like full moons!';
    const result = stringBreaker(strSrc, {
      width: 10, // width will be ignored due to splitByOpt.word
      splitOpt: splitByOpt.word
    });
    expect(result.length).equal(20);
    expect(result[0]).equal('Happy');
    expect(result[1]).equal('cat.');
    expect(result[2]).equal('The');
    expect(result[3]).equal('quick');
    expect(result[4]).equal('brown');
    expect(result[5]).equal('fox');
    expect(result[6]).equal('jumped');
    expect(result[7]).equal('over');
    expect(result[8]).equal('the');
    expect(result[9]).equal('lazy');
    expect(result[10]).equal('dog.');
    expect(result[11]).equal('The');
    expect(result[12]).equal('moon');
    expect(result[13]).equal('is');
    expect(result[14]).equal('full');
    expect(result[15]).equal('tonight.');
    expect(result[16]).equal('I');
    expect(result[17]).equal('like');
    expect(result[18]).equal('full');
    expect(result[19]).equal('moons!');
    done();
  });
  it('should break a string into words with BOM, tabs and extra spaces by word and remove the BOM', (done) => {
    // include BOM and \n \r varations
    const strSrc = '\ufeff' + '\t\t\t  Happy cat.\nThe\tquick\t\t   brown    fox  \t   jumped over the lazy dog.\r\nThe moon is full tonight.\rI like full moons!';
    const result = stringBreaker(strSrc, {
      width: 10, // width will be ignored due to splitByOpt.word
      splitOpt: splitByOpt.word
    });
    expect(result.length).equal(20);
    expect(result[0]).equal('Happy');
    expect(result[1]).equal('cat.');
    expect(result[2]).equal('The');
    expect(result[3]).equal('quick');
    expect(result[4]).equal('brown');
    expect(result[5]).equal('fox');
    expect(result[6]).equal('jumped');
    expect(result[7]).equal('over');
    expect(result[8]).equal('the');
    expect(result[9]).equal('lazy');
    expect(result[10]).equal('dog.');
    expect(result[11]).equal('The');
    expect(result[12]).equal('moon');
    expect(result[13]).equal('is');
    expect(result[14]).equal('full');
    expect(result[15]).equal('tonight.');
    expect(result[16]).equal('I');
    expect(result[17]).equal('like');
    expect(result[18]).equal('full');
    expect(result[19]).equal('moons!');
    done();
  });
  it('should break "🧀\\n😊 😀😃 😄 😁 😃😄\\n 😁🧀😊😀  " by word by eol and return 7 length string array', (done) => {
    const strSrc = '🧀\n😊 😀😃 😄 😁 😃😄\n 😁🧀😊😀  ';
    const result = stringBreaker(strSrc, {
      splitOpt: splitByOpt.word
    });
    expect(result.length).equal(7);
    expect(result[0]).equal('🧀');
    expect(result[1]).equal('😊');
    expect(result[2]).equal('😀😃');
    expect(result[3]).equal('😄');
    expect(result[4]).equal('😁');
    expect(result[5]).equal('😃😄');
    expect(result[6]).equal('😁🧀😊😀');
    done();
  });
  /**
   * Test to check and see that breaking an empty string by end of line
   * results in a string array with a length of 0
   */
  it('should break a white space string by word and return a string array with zero elements', (done) => {
    const strSrc = '\n  \t \t\t\r\n\r  ';
    const result = stringBreaker(strSrc, {
      splitOpt: splitByOpt.word
    });
    expect(result.length).equal(0);
    done();
  });
  it.only('should read line\
  \nOn this\u1680day.\u1680For this morning, when Gregor\u3000Samsa woke from troubled dreams; he found himself transformed.\
  \nBreak that line into a width of 10 but not break until a whitespace is encoutered.\
  \nWhite space at the end of each line is excluded unless it it a printing whitespace such as \u1680\
  \nWrites to temp file that madtches fixture simple_nearest_word.txt', (done) => {
      let strSrc: string = 'On this\u1680day.\u1680For this morning, when Gregor\u3000Samsa woke from troubled dreams; he found himself transformed.';
    let result = stringBreaker(strSrc, { width: 10, lenOpt: widthFlags.nearestWord });
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/simple_nearest_word.txt`, str, 'utf8');
      let src = fs.readFileSync(`${fixDir}/simple_nearest_word.txt`);
      let dest = fs.readFileSync(`${outDir}/simple_nearest_word.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
  it('should read fixture t1000_lf.txt write a tmp file that break on word or end of line', (done) => {
    let strSrc: string = fs.readFileSync(t1000, 'utf8');
    let result = stringBreaker(strSrc, { lenOpt: widthFlags.nearestWord });
    let str: string = result.join('\n');
    fs.writeFileSync(`${outDir}/t1000_lf_nearest_word.txt`, str, 'utf8');
    let src = fs.readFileSync(`${fixDir}/t1000_lf_nearest_word.txt`);
    let dest = fs.readFileSync(`${outDir}/t1000_lf_nearest_word.txt`);
    expect(src.equals(dest)).equal(true);
    done();
  });
});