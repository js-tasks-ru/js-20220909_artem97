/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {

  if (size === 0) return '';
  if (size === undefined) return string;

  let arrString = [...string];
  let retString = '';
  let count = 1;

  arrString.forEach(function (char, index, arr) {

    (char === arr[index - 1]) ? count++ : count = 1;
    if (size >= count) {retString += char}
  })
  return retString;
}
