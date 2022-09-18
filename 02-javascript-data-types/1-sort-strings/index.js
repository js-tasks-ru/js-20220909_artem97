/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const newArr = [...arr]
  return newArr.sort((par1, par2) => {
    if (param === 'asc') {
      return comp(par1, par2)
    }
    if (param === 'desc') {
      return comp(par2, par1);
    }
  });
}
function comp(a, b){
  return (a < b && a.toLowerCase() === b.toLowerCase()) ? -1 : a.toLowerCase().normalize().localeCompare(b.toLowerCase().normalize());
}
