const http = require("http");
const fs = require("fs");
const hostname = "127.0.0.1";
const port = 3000;
var ical2json = require("ical2json");
const fetch = require("node-fetch");
const utils = require("./functions/utils");
const bamboo = require("./functions/bamboo");
const config = require("./config/config");
const headers = require("./api/headers");

//////////////////////////////////////////// Inital Global variables ////////////////////////////////////////////////////////////////

let jsonFile = "bro.json";
let nameAndIdMap = new Map();
let foreCastPeople = [];

let offType = "Vacation";

let forecastAuthToken = config.keys.forecastAuthToken;
let forecastAccountId = config.keys.forecastAccountId;
let projectId = config.keys.projectId;

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

async function getJsonFile1() {
  return new Promise(resolve => {
    let rawdata = fs.readFileSync(jsonFile);
    let icalData = JSON.parse(rawdata);
    resolve(icalData);
  });
}

/////////////////////////////////////////////////////////// ForeCast Methods ///////////////////////////////////////////////////////////

async function sortToVacation(array) {
  const result = await bamboo.sortByOffType(array, offType);
  personToPost(result);
}

function personToPost(array) {
  let arrayLength = array.length;
  for (let index = 0; index < arrayLength; index++) {
    const startDate = array[index]["DTSTART;VALUE=DATE"];
    let endDateToFormat = array[index]["DTEND;VALUE=DATE"];

    let summary = array[index].SUMMARY;
    let description = array[index].DESCRIPTION;
    let endDate = bamboo.getBambooEndDate(description, endDateToFormat);
    let name = utils.splitString(summary);
    let fullName = utils.getFirstTwoWords(name);

    let personPutObject2 = {
      assignment: {
        start_date: utils.spiltDate(startDate),
        end_date: utils.spiltDate(endDate),
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
      console.log(stringy);
      makePostForecastRequest(
        urlTimeOffPut,
        apiTimeOffPath,
        stringy,
        forecastAuthToken,
        forecastAccountId,
        false
      );
    }
  }
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
      let first_name = utils.getFirstWord(array[index].SUMMARY);
      let second_name = utils.getSecondWord(array[index].SUMMARY);
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
          true
        );
      }
      namesArray.push(fullName);
    }
  });
}

//postForePeople(getJsonFile1);

function makeGetForecastRequest(url, path, authToken, accountId, boolean) {
  fetch(url, {
    method: "GET",
    headers: headers.makeHeaders(path, authToken, accountId, boolean)
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
  boolean
) {
  fetch(url, {
    method: "POST",
    body: data,
    headers: headers.makeHeaders(path, authToken, accountId, boolean)
  })
    .then(res => res.json())
    .then(json => {
      console.log(json);
    });
}

function makeDeleteForecastRequest(url, path, authToken, accountId) {
  fetch(url, {
    method: "DELETE",
    headers: headers.makeHeaders(path, authToken, accountId)
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

/////////////////////////////////////////////////////////// Bamboo Methods ///////////////////////////////////////////////////////////

function getPromise() {
  return new Promise((resolve, reject) => {
    http.get(config.urls.bambooIcal, response => {
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
    });
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
      forecastAccountId,
      true
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
