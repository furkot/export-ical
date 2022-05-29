const ical = require('../');

const fs = require('fs');
const path = require('path');

function readFileSync(name) {
  return fs.readFileSync(path.resolve(__dirname, name), 'utf8');
}

/**
 * Compare files filtering our time stamps
 */
function compareLines(actual, expected) {
  function notStamp(line) {
    return line.slice(0, 'DTSTAMP'.length) !== 'DTSTAMP';
  }

  actual = actual.split('\r\n').filter(notStamp);
  expected = expected.split('\r\n').filter(notStamp);

  actual.should.have.length(expected.length);

  for(let i = 0; i < actual.length; i += 1) {
    actual[i].should.eql(expected[i]);
  }
}


describe('furkot-ical node module', function () {

  it('simple trip', function() {
    const t = require('./fixtures/simple-trip.json');
    const generated = ical(t);
    const expected = readFileSync('fixtures/simple.ics');

    compareLines(generated, expected);
  });

  it('multi trip', function() {
    const t = require('./fixtures/multi-trip.json');
    const generated = ical(t);
    const expected = readFileSync('fixtures/multi.ics');

    compareLines(generated, expected);
  });

});
