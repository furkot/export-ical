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

  let pushed = 0;
  while (pushed < buffer.length) {
    const start = pushed;
    let end = Math.min(buffer.length, start + MAX_LEN);
    while ((buffer[end - 1] & 0xc0) === 0x80) {
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
