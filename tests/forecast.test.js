const forecast = require("../functions/forecast");

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

let mockPersonJson = {
  people: [
    {
      id: 13245,
      first_name: "John",
      last_name: "Doe",
      email: null,
      login: "disabled",
      admin: true,
      archived: false,
      subscribed: false,
      avatar_url:
        "https://d3s3969qhosaug.cloudfront.net/default-avatars/4b4c.png",
      roles: [],
      updated_at: "2020-03-09T21:21:52.736Z",
      updated_by_id: 12345,
      harvest_user_id: null,
      weekly_capacity: 144000,
      working_days: [Object],
      color_blind: false,
      personal_feed_token_id: null
    }
  ]
};

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

test("returns a value from a map given a key", () => {
  expect(forecast.assignForecastId(myMockMap, "Elon Musk")).toBe(54321);
});

test("returns an object given certain json values", () => {
  expect(forecast.genForePeople(mockPersonJson)).toMatchObject([
    {
      id: 13245,
      fullName: "John Doe"
    }
  ]);
});
