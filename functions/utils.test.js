const utils = require("./utils");

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

test("if word is found in string return its index", () => {
  expect(utils.wordSearch("testing is great fun", "testing")).toBe(0);
});

test("if string value is less than 10 add a zero to it to make it a double digit", () => {
  expect(utils.makeDoubleDigit("5")).toBe("05");
});

test("return first word from a string", () => {
  expect(utils.getFirstWord("it is cold")).toBe("it");
});

test("return second word from a string", () => {
  expect(utils.getSecondWord("it is cold")).toBe("is");
});

test("return first two words from a string", () => {
  expect(utils.getFirstTwoWords("it is cold")).toBe("it is");
});
