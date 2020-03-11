module.exports = {
  splitString: function(string) {
    return string.replace(/ *\([^)]*\) */g, "");
  },
  spiltDate: function(string) {
    return string.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
  },
  doesStringExist: function(number) {
    if (number > -1) {
      return true;
    } else {
      return false;
    }
  },
  wordSearch: function(string, word) {
    return string.search(word);
  },
  makeDoubleDigit: function(string) {
    let value;
    if (string < 10) {
      value = `0${string}`;
      return value;
    } else {
      value = string;
      return value;
    }
  },
  getFirstWord: function(string) {
    let firstWord = string.substr(0, string.indexOf(" "));
    return firstWord;
  },
  getSecondWord: function(string) {
    let split = string.substr(string.indexOf(" "));
    let trim = split.trimLeft();
    let secondWord = trim.substr(0, trim.indexOf(" "));
    return secondWord;
  },
  getFirstTwoWords: function(string) {
    let str = string
      .split(" ")
      .slice(0, 2)
      .join(" ");
    return str;
  },
  checkForDash: function(string) {
    let bool = /[\–]/.test(string);
    return bool;
  },
  rmvWords: function(string, ...args) {
    let str = string;
    args.map(element => {
      str = str.replace(element, "");
    });
    return str.trimLeft();
  },
  rmvParenth: function(string) {
    return string.replace(/[{()}]/g, "").trimLeft();
  },
  getJsonFile: async function(file) {
    return new Promise(resolve => {
      let rawdata = fs.readFileSync(file);
      let data = JSON.parse(rawdata);
      resolve(data);
    });
  }
};
