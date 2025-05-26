import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import property from '../lib/property.js';

const decoder = new TextDecoder();

describe('property', () => {
  it('short', () => {
    const p = property('abc', 'ąbć');

    const { value, done } = p.next();

    assert.equal(done, false, 'done should be false');
    assert.equal(decoder.decode(value), 'abc:ąbć\r\n');
    assert.deepEqual(p.next(), { value: undefined, done: true }, 'no more values');
  });

  it('long', () => {
    const p = property('A', 'a'.repeat(100));

    const values = Array.from(p);

    assert.equal(values.length, 2, 'values should have length 2');
    // 75 octets + \r\n
    assert.equal(values[0].length, 75 + 2);
    const strings = values.map(v => decoder.decode(v));
    assert.equal(strings[0], `A:${'a'.repeat(73)}\r\n`);
    assert.equal(strings[1], ` ${'a'.repeat(27)}\r\n`);
  });

  it('very long', () => {
    const p = property('A', 'a'.repeat(300));

    const strings = Array.from(p).map(s => decoder.decode(s));

    assert.equal(strings.length, 5, 'strings should have length 5');
    assert.equal(strings[0], `A:${'a'.repeat(73)}\r\n`);
    assert.equal(strings[1], ` ${'a'.repeat(74)}\r\n`);
    assert.equal(strings[2], ` ${'a'.repeat(74)}\r\n`);
    assert.equal(strings[3], ` ${'a'.repeat(74)}\r\n`);
    assert.equal(strings[4], ` ${'a'.repeat(5)}\r\n`);
  });

  it('long with multibyte', () => {
    const p = property('A', 'ą'.repeat(100));

    const strings = Array.from(p).map(s => decoder.decode(s));

    assert.equal(strings.length, 3, 'strings should have length 3');
    assert.equal(strings[0], `A:${'ą'.repeat(36)}\r\n`);
    assert.equal(strings[1], ` ${'ą'.repeat(37)}\r\n`);
    assert.equal(strings[2], ` ${'ą'.repeat(100 - 37 - 36)}\r\n`);
  });

  it('long with emoji', () => {
    const p = property('A', '🌻'.repeat(100));

    const strings = Array.from(p).map(s => decoder.decode(s));

    assert.equal(strings.length, 6, 'strings should have length 6');
    assert.equal(strings[0], `A:${'🌻'.repeat(18)}\r\n`);
    assert.equal(strings[1], ` ${'🌻'.repeat(18)}\r\n`);
    assert.equal(strings[2], ` ${'🌻'.repeat(18)}\r\n`);
    assert.equal(strings[3], ` ${'🌻'.repeat(18)}\r\n`);
    assert.equal(strings[4], ` ${'🌻'.repeat(18)}\r\n`);
    assert.equal(strings[5], ` ${'🌻'.repeat(100 - 5 * 18)}\r\n`);
  });
});
