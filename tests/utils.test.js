const utils = require("../functions/utils");

test("should remove all brackets from a string and just return a name", () => {
  expect(utils.splitString("Brian May Harold (Vacation - 7 days)")).toBe(
    "Brian May Harold"
  );
});

test("seperate date with dashes", () => {
  expect(utils.spiltDate("20200307")).toBe("2020-03-07");
});

test("if number is greater than -1 return true", () => {
  expect(utils.doesStringExist(1)).toBe(true);
});

test("if word is found in string it returns its index", () => {
  expect(utils.wordSearch("testing is great fun", "testing")).toBe(0);
});

test("if string value is less than 10 it adds a zero to it to make it a double digit", () => {
  expect(utils.makeDoubleDigit("5")).toBe("05");
});

test("returns the first word from a string", () => {
  expect(utils.getFirstWord("it is cold")).toBe("it");
});

test("returns the second word from a string", () => {
  expect(utils.getSecondWord("it is cold")).toBe("is");
});

test("returns the first two words from a string", () => {
  expect(utils.getFirstTwoWords("it is cold")).toBe("it is");
});

test("should remove the the two words you define from a given string", () => {
  expect(utils.rmvWords("Time off Joe is great", "Time", "off")).toBe(
    "Joe is great"
  );
});

test("should remove parentheses from a string ", () => {
  expect(utils.rmvParenth("(hello there) my name is joe")).toBe(
    "hello there my name is joe"
  );
});
