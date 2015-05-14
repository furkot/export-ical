var ical = require('../');

var fs = require('fs');
var path = require('path');

function readFileSync(name) {
  return fs.readFileSync(path.join(__dirname, name), 'utf8');
}

/**
 * Compare files filtering our time stamps
 */
function compareLines(actual, expected) {
  function notStamp(line) {
    return line.slice(0, 'DTSTAMP'.length) !== 'DTSTAMP';
  }

  var i;

  actual = actual.split('\r\n').filter(notStamp);
  expected = expected.split('\r\n').filter(notStamp);

  actual.should.have.length(expected.length);

  for(i = 0; i < actual.length; i += 1) {
    actual[i].should.eql(expected[i]);
  }
}


describe('furkot-ical node module', function () {

  it('simple trip', function() {
    var t = require('./fixtures/simple-trip.json'),
      generated = ical(t),
      expected = readFileSync('fixtures/simple.ics');

    compareLines(generated, expected);
  });

  it('multi trip', function() {
    var t = require('./fixtures/multi-trip.json'),
      generated = ical(t),
      expected = readFileSync('fixtures/multi.ics');

    compareLines(generated, expected);
  });

});
