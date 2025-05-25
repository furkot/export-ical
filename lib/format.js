export function formatArray(arr) {
  return arr.join(';');
}

export function formatText(str) {
  return str.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');
}
