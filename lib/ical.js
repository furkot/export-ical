const icalendar = require('@pirxpilot/icalendar');
const crypto = require('crypto');

exports = module.exports = ical;
exports.contentType = 'text/calendar';
exports.extension = 'ics';

function id2uuid(id) {
  const sha = crypto.createHash('sha224');
  sha.update(id);
  return `${sha.digest('hex')}@furkot.com`;
}

const offset = new Date().getTimezoneOffset() * 60 * 1000;

function ts2date(ts) {
  return new Date(ts + offset);
}

function calendar({ metadata, routes }) {
  const cal = new icalendar.iCalendar(true);

  cal.addProperty('VERSION', '2.0');
  cal.addProperty('PRODID', '-//code42day//Furkot - road trip planner//EN');
  cal.addProperty('X-WR-CALNAME', metadata.name);
  if (metadata.desc && metadata.desc.length) {
    cal.addProperty('X-WR-CALDESC', metadata.desc);
  }
  routes[0].points.forEach(step => {
    const event = new icalendar.VEvent(id2uuid(step.id));
    event.setSummary(step.name);
    if (step.notes && step.notes.length) {
      event.setDescription(step.notes);
    }
    if (step.url) {
      event.addProperty('URL', step.url);
    }
    event.addProperty('LOCATION', step.address);
    event.addProperty('GEO', [step.coordinates.lat, step.coordinates.lon].join(';'));
    event.addProperty('DTSTART', ts2date(step.arrival_time));
    event.addProperty('DTEND', ts2date(step.departure_time));
    cal.addComponent(event);
  });
  return cal;
}

function ical(options) {
  return calendar(options).toString();
}
