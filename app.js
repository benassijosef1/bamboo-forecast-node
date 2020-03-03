const http = require("http");
const fs = require("fs");
const hostname = "127.0.0.1";
const port = 3000;
var ical2json = require("ical2json");
const fetch = require("node-fetch");

//////////////////////////////////////////// Inital Global variables ////////////////////////////////////////////////////////////////

let jsonFile = "bro.json";
let nameAndIdMap = new Map();
let foreCastPeople = [];

let forecastAuthToken =
  "Bearer 2230528.at.SbbxCGsXcb1VTUQtmvPmyzWM7X2BQtoZagHoLpPr0T_3qhZ8B5mGQQhak1R9EuOvb3p4zfjMOlm58v0kQnEzkg";
let forecastAccountId = "1246251";
let projectId = "2468940";

// Kaps Details

// let forecastAuthToken =
//   "Bearer 1634237.pt.lmMVrMiukzHIFzHW8vVHaR5FOWLuopIr3slt3HLcUIUdlo9PTOhoVci9N3KDVLOt1Yrr8uuFgisNlVzQBGofIw";
// let forecastAccountId = "795781";
// let projectId = "1078238";

let urlTimeOffPut = "https://api.forecastapp.com/assignments";
let putRequest = "PUT";
let apiTimeOffPath = "/assignments";

let urlPeople = "https://api.forecastapp.com/people";
let getRequest = "GET";
let apiPeoplePath = "/people";

let icalToJsonData;
/////////////////////////////////////////////////////////// Get Files ///////////////////////////////////////////////////////////

// function getJsonFile() {
//   let rawdata = fs.readFileSync(jsonFile);
//   let icalData = JSON.parse(rawdata);
//   sortToVacation(icalData);
// }

async function getJsonFile1() {
  return new Promise(resolve => {
    let rawdata = fs.readFileSync(jsonFile);
    let icalData = JSON.parse(rawdata);
    resolve(icalData);
  });
}

/////////////////////////////////////////////////////////// ForeCast Methods ///////////////////////////////////////////////////////////

async function sortVacation(arr) {
  let array = arr;

  let arrayLength = array.length;
  let vacationData = [];
  let otherData = [];
  return new Promise(resolve => {
    for (let index = 0; index < arrayLength; index++) {
      let object = array[index];
      let summary = array[index].SUMMARY;
      if (doesStringExist(searchVaction(summary, "Vacation")) === true) {
        vacationData.push(object);
      } else {
        otherData.push(object);
      }
    }
    resolve(vacationData);
  });
}

async function sortToVacation(array) {
  const result = await sortVacation(array);
  personToPost(result);
}

function personToPost(array) {
  let arrayLength = array.length;
  for (let index = 0; index < arrayLength; index++) {
    const startDate = array[index]["DTSTART;VALUE=DATE"];
    let endDateToFormat = array[index]["DTEND;VALUE=DATE"];

    let summary = array[index].SUMMARY;
    let description = array[index].DESCRIPTION;
    let endDate = getBambooEndDate(description, endDateToFormat);
    let name = splitString(summary);
    let fullName = getName(name);

    let personPutObject2 = {
      assignment: {
        start_date: spiltDate(startDate),
        end_date: spiltDate(endDate),
        allocation: null,
        active_on_days_off: false,
        repeated_assignment_set_id: null,
        project_id: projectId,
        person_id: assignForeID(fullName),
        placeholder_id: null
      }
    };

    if (
      personPutObject2.assignment.person_id != null ||
      personPutObject2.assignment.person_id != undefined
    ) {
      let stringy = JSON.stringify(personPutObject2);
      makePostForecastRequest(
        urlTimeOffPut,
        apiTimeOffPath,
        stringy,
        forecastAuthToken,
        forecastAccountId,
        makeHeaders
      );
    }
  }
}

function getBambooEndDate(string, date) {
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
    if (splitDash.length > 2) {
      let endDigit = splitDash.split(" ")[1].trimLeft();
      let digit = makeDoubleDigit(endDigit);
      let replaceEnd = d.substr(0, d.length - 2) + `${digit}`;
      return replaceEnd;
    }
    let digit = makeDoubleDigit(splitDash);
    let replaceEnd = d.substr(0, d.length - 2) + `${digit}`;
    return replaceEnd;
  }
  if (boolDash === false) {
    let rmvSlash = formated.split("\\")[0];
    let endDigit = rmvSlash.split(" ")[1].trimLeft();
    let digit = makeDoubleDigit(endDigit);
    let replaceEnd = d.substr(0, d.length - 2) + `${digit}`;
    return replaceEnd;
  }
}

function makeDoubleDigit(val) {
  let value;
  if (val < 10) {
    value = `0${val}`;
    return value;
  } else {
    value = val;
    return value;
  }
}

function searchVaction(string, searchWord) {
  return string.search(searchWord);
}

function doesStringExist(n) {
  if (n > -1) {
    return true;
  } else {
    return false;
  }
}
function splitString(nameString) {
  return nameString.replace(/ *\([^)]*\) */g, "");
}
function spiltDate(dateString) {
  return dateString.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
}

function assignForeID(name) {
  return nameAndIdMap.get(name);
}
function creatNameKeyMap(array) {
  let arrayLength = array.length;
  for (let index = 0; index < arrayLength; index++) {
    let fullName = array[index].firstName + " " + array[index].lastName;
    let id = array[index].forecastId;
    nameAndIdMap.set(fullName, id);
  }
}

function postForePeople() {
  getJsonFile1().then(array => {
    let arrayLength = array.length;
    let namesArray = [];

    for (let index = 0; index < arrayLength; index++) {
      let first_name = firstName(array[index].SUMMARY);
      let second_name = secondName(array[index].SUMMARY);
      let fullName = first_name + second_name;
      let names = namesArray.indexOf(fullName);
      let postData = makePutPeolpleBody(first_name, second_name);

      if (names === -1) {
        makePostForecastRequest(
          urlPeople,
          apiPeoplePath,
          postData,
          forecastAuthToken,
          forecastAccountId,
          makeHeadersGenForePeople
        );
      }
      namesArray.push(fullName);
    }
  });
}

function firstName(string) {
  let firstName = string.substr(0, string.indexOf(" "));
  return firstName;
}

function secondName(string) {
  let split = string.substr(string.indexOf(" "));
  let trim = split.trimLeft();
  let secondName = trim.substr(0, trim.indexOf(" "));
  return secondName;
}

function getName(string) {
  let name = string
    .split(" ")
    .slice(0, 2)
    .join(" ");
  return name;
}
//postForePeople(getJsonFile1);

function makeGetForecastRequest(url, path, authToken, accountId) {
  fetch(url, {
    method: "GET",
    headers: makeHeaders(path, authToken, accountId)
  })
    .then(res => res.json())
    .then(json => {
      let array = json.people;
      let arrayLength = json.people.length;
      let foreCastPeople = [];

      for (let index = 0; index < arrayLength; index++) {
        let person = {
          firstName: array[index].first_name,
          lastName: array[index].last_name,
          forecastId: array[index].id
        };
        foreCastPeople.push(person);
      }
      return foreCastPeople;
    })
    .then(res => {
      //console.log(foreCastPeople);
      creatNameKeyMap(res);
      sortToVacation(icalToJsonData);
    });
}

function makePostForecastRequest(
  url,
  path,
  data,
  authToken,
  accountId,
  headerfunction
) {
  fetch(url, {
    method: "POST",
    body: data,
    headers: headerfunction(path, authToken, accountId)
  })
    .then(res => res.json())
    .then(json => {
      console.log(json);
    });
}

function makeDeleteForecastRequest(url, path, authToken, accountId) {
  fetch(url, {
    method: "DELETE",
    headers: makeHeaders(path, authToken, accountId)
  })
    .then(res => res.json())
    .then(json => console.log(json));
}

function getDeleteData() {
  let rawdata = fs.readFileSync("testDeleteData.json");
  let delData = JSON.parse(rawdata);

  for (let index = 0; index < delData.length; index++) {
    const id = delData[index].assignment.id;
    console.log(id);
    let delUrl = `https://api.forecastapp.com/assignments/${id}`;
    let delPath = `/assignments/${id}`;
    try {
      makeDeleteForecastRequest(
        delUrl,
        delPath,
        forecastAuthToken,
        forecastAccountId
      );
    } catch (err) {
      console.log(err);
    }
  }
}

function deletePeople() {
  let rawdata = fs.readFileSync("peopletoDelete.json");
  let delData = JSON.parse(rawdata);

  for (let index = 0; index < delData.length; index++) {
    const id = delData[index].person.id;
    console.log(id);
    let delUrl = `https://api.forecastapp.com/people/${id}`;
    let delPath = `/people/${id}`;
    try {
      makeDeleteForecastRequest(
        delUrl,
        delPath,
        forecastAuthToken,
        forecastAccountId
      );
    } catch (err) {
      console.log(err);
    }
  }
}

//deletePeople();

//postForePeople();

//getDeleteData();

function makePutPeolpleBody(first_name, last_name) {
  return JSON.stringify({
    person: {
      first_name: first_name,
      last_name: last_name,
      email: null,
      admin: true,
      avatar_url: null,
      roles: [],
      archived: false,
      login: "disabled",
      subscribed: false,
      color_blind: false,
      weekly_capacity: 144000,
      working_days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      harvest_user_id: null,
      personal_feed_token_id: null
    }
  });
}

function makeHeaders(path, authToken, accountId) {
  return {
    "Content-Type": "application/json",
    authority: "api.forecastapp.com",
    path: path,
    scheme: "https",
    accept: "application/json, text/javascript, */*; q=0.01",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    authorization: authToken,
    length: "224", // Buffer.byteLength('অ') ?????
    "forecast-account-id": accountId,
    "forecast-client-version": "1.0.2+3ac3e7d",
    origin: "https://forecastapp.com",
    referer: "https://forecastapp.com/",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site"
  };
}

function makeHeadersGenForePeople(path, authToken, accountId) {
  return {
    "Content-Type": "application/json",
    authority: "api.forecastapp.com",
    path: path,
    scheme: "https",
    accept: "application/json, text/javascript, */*; q=0.01",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    authorization: authToken,
    "forecast-account-id": accountId,
    "forecast-client-version": "1.0.2+3ac3e7d",
    origin: "https://forecastapp.com",
    referer: "https://forecastapp.com/",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site"
  };
}

/////////////////////////////////////////////////////////// Bamboo Methods ///////////////////////////////////////////////////////////

function getPromise() {
  return new Promise((resolve, reject) => {
    http.get(
      "http://zaizi.bamboohr.com/feeds/feed.php?id=9bc86de31f5162c30b88f88d1fe4a425",
      response => {
        let chunks_of_data = [];

        response.on("data", fragments => {
          chunks_of_data.push(fragments);
        });

        response.on("end", () => {
          let response_body = Buffer.concat(chunks_of_data);
          resolve(response_body.toString());
        });

        response.on("error", error => {
          reject(error);
        });
      }
    );
  });
}
async function makeSynchronousRequest(request) {
  try {
    let http_promise = getPromise();
    let response_body = await http_promise;
    let d = ical2json.convert(response_body);
    let jsonContennt = d.VCALENDAR[0].VEVENT;
    let data = JSON.stringify(jsonContennt);
    fs.writeFileSync("bro.json", data);
    icalToJsonData = JSON.parse(data);
  } catch (error) {
    console.log(error);
  }
}
(async function() {
  await makeSynchronousRequest().then(res => {
    makeGetForecastRequest(
      urlPeople,
      apiPeoplePath,
      forecastAuthToken,
      forecastAccountId
    );
  });
})();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// { errors:
//   [ 'Project assignment dates cannot overlap for the same user' ] }

// do someting with this error message??/ so when we make a post can we make a put ????
