const { v5: uuid } = require('uuid');
const { formatArray } = require("./format");
const property = require("./property");

exports = module.exports = ical;
exports.contentType = 'text/calendar';
exports.extension = 'ics';

const NAMESPACE = "e29ebc86-9ab8-420b-a8c6-932a120f4461";

function id2uuid(id, day) {
  if (day) {
    id += day;
  }
  return uuid(id, NAMESPACE) + '@furkot.com';
}

function ts2date(ts) {
  // remove dashes and colons and strip milliseconds
  return new Date(ts).toISOString().replace(/[-:]/g, '').slice(0, -5);
}

function* ical({ metadata, routes }) {
  const dtstamp = ts2date(Date.now());

  yield* property('BEGIN', 'VCALENDAR');
  yield* property('VERSION', '2.0');
  yield* property('PRODID', '-//code42day//Furkot - road trip planner//EN');
  yield* property('X-WR-CALNAME', metadata.name);
  yield* property('X-WR-CALDESC', metadata.desc);

  for (const step of routes[0].points) {
    if (!(step.id && (step.name || step.address || step.url || step.notes))) {
      continue;
    }
    yield* property('BEGIN', 'VEVENT');
    yield* property('DTSTAMP', dtstamp);
    yield* property('UID', id2uuid(step.id, step.day));
    yield* property('SUMMARY', step.name);
    yield* property('DESCRIPTION', step.notes);
    yield* property('URL', step.url);
    yield* property('LOCATION', step.address);
    yield* property('GEO', [step.coordinates.lat, step.coordinates.lon], formatArray);
    yield* property('DTSTART', ts2date(step.arrival_time));
    yield* property('DTEND', ts2date(step.departure_time));
    yield* property('END', 'VEVENT');
  }
  yield* property('END', 'VCALENDAR');
}
