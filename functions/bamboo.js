const utils = require("./utils");
module.exports = {
  getBambooEndDate: function(string, date) {
    let d = date;
    let formated = utils.rmvParenth(utils.rmvWords(string, "Time", "off"));
    let boolDash = utils.checkForDash(formated);

    let replaceEnd;
    let digit;
    let endDigit;

    if (boolDash === true) {
      let splitDash = formated.split("–")[1].trimLeft();
      if (splitDash.length > 2) {
        endDigit = splitDash.split(" ")[1].trimLeft();
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
      endDigit = rmvSlash.split(" ")[1].trimLeft();
      digit = utils.makeDoubleDigit(endDigit);
      replaceEnd = d.substr(0, d.length - 2) + `${digit}`;
      return replaceEnd;
    }
  },
  sortByOffType: async function(arr, holidayType, key) {
    let array = arr;
    let arrayLength = array.length;
    let vacationData = [];
    let otherData = [];
    return new Promise(resolve => {
      for (let index = 0; index < arrayLength; index++) {
        let object = array[index];
        let summary = array[index][`${key}`];
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
  },
  offType: "Vacation",
  summary: "SUMMARY"
};
