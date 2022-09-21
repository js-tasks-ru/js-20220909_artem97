/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(field) {
  let pathArr = field.split('.');
  let tempObj;
  return function getParam(obj, index = 0){
    tempObj = obj[pathArr[index]]; //стоит в таких случаях делать временную переменную или лучше обращаться каждый раз к переменным объекта?
    return (typeof(tempObj) === "object")? getParam(tempObj, index + 1) : tempObj;
  }  
}

