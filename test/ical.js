const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const ical = require('../');

const fs = require('node:fs');
const path = require('node:path');

function readFileSync(name) {
  return fs.readFileSync(path.resolve(__dirname, name), 'utf8');
}

/* global TextDecoder */
const decoder = new TextDecoder();

/**
 * Compare files filtering our time stamps
 */
function compareLines(actual, expected) {
  function notStamp(line) {
    return !line.startsWith('DTSTAMP');
  }

  actual = Array.from(actual)
    .map(x => decoder.decode(x))
    .join('');

  assert(actual.endsWith('\r\n'), `${actual.slice(-10)} should end with \\r\\n`);

  actual = actual.split('\r\n').filter(notStamp);
  expected = expected.split('\r\n').filter(notStamp);

  for (let i = 0; i < actual.length; i += 1) {
    assert.equal(actual[i], expected[i], `line: ${i}`);
  }

  assert.equal(actual.length, expected.length, 'line count');
}

describe('ical', () => {
  it('simple trip', () => {
    const t = require('./fixtures/simple-trip.json');
    const generated = ical(t);
    const expected = readFileSync('fixtures/simple.ics');

    compareLines(generated, expected);
  });

  it('multi trip', () => {
    const t = require('./fixtures/multi-trip.json');
    const generated = ical(t);
    const expected = readFileSync('fixtures/multi.ics');

    compareLines(generated, expected);
  });
});
