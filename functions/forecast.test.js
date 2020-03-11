const forecast = require("./forecast");

let arr = ["Functional"];
let string = "Programming";

let mockPeopleArray = [
  { id: 12345, fullName: "Bruce Wayne" },
  { id: 54321, fullName: "Elon Musk" },
  { id: 11111, fullName: "James Bond" }
];

let myMockMap = new Map();
myMockMap.set("Bruce Wayne", 12345);
myMockMap.set("Elon Musk", 54321);
myMockMap.set("James Bond", 11111);

function tester(arr, string) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(arr[0] + " " + string);
    }, 3000);
  });
}

test("function sortType should injest a fucntion,array and string and spit out a resolve value for the function passed in", async () => {
  const data = await forecast.sortType(tester, arr, string);
  expect(data).toBe("Functional Programming");
});

test("should take an array and return a map", () => {
  expect(forecast.createForecastKeyMap(mockPeopleArray)).toMatchObject(
    myMockMap
  );
});
