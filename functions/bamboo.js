const utils = require("./utils");
module.exports = {
  getBambooEndDate: function(string, date) {
    let d = date;
    let formated = string
      .replace(/[\Time/&]+/g, "")
      .replace(/[\off/&]+/g, "")
      .replace(/[\off/&]+/g, "")
      .replace(/[{()}]/g, "")
      .trimLeft();
    let boolDash = /[\–]/.test(formated);

    if (boolDash === true) {
      let splitDash = formated.split("–")[1].trimLeft();
      let replaceEnd;
      let digit;
      if (splitDash.length > 2) {
        let endDigit = splitDash.split(" ")[1].trimLeft();
        digit = utils.makeDoubleDigit(endDigit);
        replaceEnd = d.substr(0, d.length - 2) + `${digit}`;
        return replaceEnd;
      }
      digit = utils.makeDoubleDigit(splitDash);
      replaceEnd = d.substr(0, d.length - 2) + `${digit}`;
      return replaceEnd;
    }
    if (boolDash === false) {
      let rmvSlash = formated.split("\\")[0];
      let endDigit = rmvSlash.split(" ")[1].trimLeft();
      digit = utils.makeDoubleDigit(endDigit);
      replaceEnd = d.substr(0, d.length - 2) + `${digit}`;
      return replaceEnd;
    }
  },
  sortByOffType: async function(arr, holidayType) {
    let array = arr;
    let arrayLength = array.length;
    let vacationData = [];
    let otherData = [];
    return new Promise(resolve => {
      for (let index = 0; index < arrayLength; index++) {
        let object = array[index];
        let summary = array[index].SUMMARY;
        if (
          utils.doesStringExist(utils.wordSearch(summary, holidayType)) === true
        ) {
          vacationData.push(object);
        } else {
          otherData.push(object);
        }
      }
      resolve(vacationData);
    });
  }
};
