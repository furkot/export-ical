import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import ical from '../lib/ical.js';

import multiTrip from './fixtures/multi-trip.json' with { type: 'json' };
import simpleTrip from './fixtures/simple-trip.json' with { type: 'json' };

function readFileSync(name) {
  return fs.readFileSync(path.resolve(import.meta.dirname, name), 'utf8');
}

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
    const generated = ical(simpleTrip);
    const expected = readFileSync('fixtures/simple.ics');

    compareLines(generated, expected);
  });

  it('multi trip', () => {
    const generated = ical(multiTrip);
    const expected = readFileSync('fixtures/multi.ics');

    compareLines(generated, expected);
  });
});
