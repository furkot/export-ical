const { v5: uuid } = require('uuid');

exports = module.exports = ical;
exports.contentType = 'text/calendar';
exports.extension = 'ics';

const NAMESPACE = "e29ebc86-9ab8-420b-a8c6-932a120f4461";

function id2uuid(id) {
  return uuid(id, NAMESPACE) + '@furkot.com';
}

const offset = new Date().getTimezoneOffset() * 60 * 1000;

function ts2date(ts) {
  return formatDate(new Date(ts + offset));
}

/* global TextEncoder */

const MAX_LEN = 75;
const encoder = new TextEncoder();

function* property(name, value, format = formatText) {
  value = format(value);
  const line = name + ':' + value;
  const ab = encoder.encode(line);

  const buffer = new Uint8Array(ab);

  let pushed = 0;
  while(pushed < buffer.length) {
    const start = pushed;
    let end = Math.min(buffer.length, start + MAX_LEN);
    while((buffer[end - 1] & 0xc0) === 0x80) {
      // do not split multibyte characters
      end -= 1;
    }
    if (end <= start) {
      // cannot split this line
      break;
    }
    const slice = buffer.slice(start, end);
    yield prepare(slice, start > 0);
    pushed = end;
  }

  function prepare(slice, prefix) {
    const prefixLen = prefix ? 1 : 0;
    const out = new Uint8Array(slice.length + 2 + prefixLen);
    if (prefix) {
      out[0] = 0x20; // space
    }
    out.set(slice, prefixLen);
    out[out.length - 2] = 0x0D; // CR
    out[out.length - 1] = 0x0A; // LF
    return out;
  }
}

function formatText(str) {
  return str.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');
}

function formatDate(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth()+1),
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');

  function pad(n) { return n.toString().padStart(2, 0); }
}

function formatArray(arr) {
  return arr.join(';');
}

function* ical({ metadata, routes }) {
  const dtstamp = formatDate(new Date());

  yield* property('BEGIN', 'VCALENDAR');
  yield* property('VERSION', '2.0');
  yield* property('PRODID', '-//code42day//Furkot - road trip planner//EN');
  yield* property('X-WR-CALNAME', metadata.name);
  if (metadata.desc && metadata.desc.length) {
    yield* property('X-WR-CALDESC', metadata.desc);
  }

  for(const step of routes[0].points) {
    if (!step.id) {
      continue;
    }
    yield* property('BEGIN', 'VEVENT');
    yield* property('DTSTAMP', dtstamp);
    yield* property('UID', id2uuid(step.id));
    yield* property('SUMMARY', step.name);
    if (step.notes && step.notes.length) {
      yield* property('DESCRIPTION', step.notes);
    }
    if (step.url) {
      yield* property('URL', step.url);
    }
    yield* property('LOCATION', step.address);
    yield* property('GEO', [step.coordinates.lat, step.coordinates.lon], formatArray);
    yield* property('DTSTART', ts2date(step.arrival_time));
    yield* property('DTEND', ts2date(step.departure_time));
    yield* property('END', 'VEVENT');
  }
  yield* property('END', 'VCALENDAR');
}
