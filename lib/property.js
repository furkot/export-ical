const { formatText } = require("./format");

module.exports = property;

/* global TextEncoder */

const MAX_LEN = 75;
const encoder = new TextEncoder();

function* property(name, value, format = formatText) {
  if (value == null || value === '') {
    return;
  }
  value = format(value);
  const line = name + ':' + value;
  const ab = encoder.encode(line);

  const buffer = new Uint8Array(ab);

  let start = 0;
  while (true) {
    let end = start + MAX_LEN;
    if (end >= buffer.length) {
      yield prepare(start, buffer.length);
      break;
    }
    while ((buffer[end] & 0b11000000) === 0b10000000) {
      // do not split multibyte characters
      end -= 1;
    }
    if (end <= start) {
      // cannot split this line
      break;
    }
    yield prepare(start, end);
    start = end - 1;
    buffer[start] = 0x20; // space
  }

  function prepare(start, end) {
    const out = new Uint8Array(end - start + 2);
    out.set(buffer.subarray(start, end));
    out[out.length - 2] = 0x0D; // CR
    out[out.length - 1] = 0x0A; // LF
    return out;
  }
}
