/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let newArr = Array.from(arr)
  return newArr.sort(
    (a, b) => {
      if (param === 'asc')
        return (a < b && a.toLowerCase() === b.toLowerCase()) ? -1 : a.toLowerCase().localeCompare(b.toLowerCase());
      if (param === 'desc')
        return (b < a && a.toLowerCase() === b.toLowerCase()) ? -1 : b.toLowerCase().localeCompare(a.toLowerCase());
    }
  )
}
