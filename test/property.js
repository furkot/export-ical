const { describe, it } = require('node:test');
const property = require('../lib/property');

/* global TextDecoder */
const decoder = new TextDecoder();

describe('property', function () {

  it('short', function () {
    const p = property('abc', 'ąbć');

    const { value, done } = p.next();

    done.should.equal(false);
    decoder.decode(value).should.equal('abc:ąbć\r\n');

    p.next().done.should.equal(true);
  });

  it('long', function () {
    const p = property('A', 'a'.repeat(100));

    const values = Array.from(p);

    values.should.have.length(2);
    // 75 octets + \r\n
    values[0].should.have.length(75 + 2);

    const strings = values.map(v => decoder.decode(v));
    strings[0].should.equal(`A:${'a'.repeat(73)}\r\n`);
    strings[1].should.equal(` ${'a'.repeat(27)}\r\n`);
  });

  it('very long', function () {
    const p = property('A', 'a'.repeat(300));

    const strings = Array.from(p).map(s => decoder.decode(s));

    strings.should.have.length(5);
    strings[0].should.equal(`A:${'a'.repeat(73)}\r\n`);
    strings[1].should.equal(` ${'a'.repeat(74)}\r\n`);
    strings[2].should.equal(` ${'a'.repeat(74)}\r\n`);
    strings[3].should.equal(` ${'a'.repeat(74)}\r\n`);
    strings[4].should.equal(` ${'a'.repeat(5)}\r\n`);
  });

  it('long with multibyte', function () {
    const p = property('A', 'ą'.repeat(100));

    const strings = Array.from(p).map(s => decoder.decode(s));

    strings.should.have.length(3);
    strings[0].should.equal(`A:${'ą'.repeat(36)}\r\n`);
    strings[1].should.equal(` ${'ą'.repeat(37)}\r\n`);
    strings[2].should.equal(` ${'ą'.repeat(100 - 37 - 36)}\r\n`);
  });

  it('long with emoji', function () {
    const p = property('A', '🌻'.repeat(100));

    const strings = Array.from(p).map(s => decoder.decode(s));

    strings.should.have.length(6);
    strings[0].should.equal(`A:${'🌻'.repeat(18)}\r\n`);
    strings[1].should.equal(` ${'🌻'.repeat(18)}\r\n`);
    strings[2].should.equal(` ${'🌻'.repeat(18)}\r\n`);
    strings[3].should.equal(` ${'🌻'.repeat(18)}\r\n`);
    strings[4].should.equal(` ${'🌻'.repeat(18)}\r\n`);
    strings[5].should.equal(` ${'🌻'.repeat(100 - 5 * 18)}\r\n`);
  });
});
