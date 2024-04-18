module.exports = {
  formatArray,
  formatText
};

function formatArray(arr) {
  return arr.join(';');
}

function formatText(str) {
  return str.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');
}
