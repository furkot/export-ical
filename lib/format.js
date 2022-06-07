module.exports = {
  formatArray,
  formatDate,
  formatText
};


function formatDate(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
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

function formatText(str) {
  return str.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');
}
