const config = require("../config/config");
const forecast = require("../functions/forecast");
const bamboo = require("../functions/bamboo");
const headers = require("./headers");
const fs = require("fs");
const ical2json = require("ical2json");
const http = require("http");
const utils = require("../functions/utils");
const fetch = require("node-fetch");

let offType = bamboo.offType;

let urlTimeOffPut = config.urls.urlTimeOffPut;
let apiTimeOffPath = config.paths.apiTimeOffPath;
let urlPeople = config.urls.urlPeople;
let apiPeoplePath = config.paths.apiPeoplePath;

let forecastAuthToken = config.keys.forecastAuthToken;
let forecastAccountId = config.keys.forecastAccountId;

module.exports = {
  makeGetBambooRequest: function() {
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
  },
  makeGetForecastRequest: function(
    url,
    path,
    authToken,
    accountId,
    boolean,
    func
  ) {
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
        forecast.createForecastKeyMap(res);
        forecast.sortType(func, offType).then(res => {
          forecast.getAssignmentsToPost(res).then(res => {
            let length = res.length;
            for (let index = 0; index < length; index++) {
              let element = res[index];
              let stringy = JSON.stringify(element);
              this.makePostForecastRequest(
                urlTimeOffPut,
                apiTimeOffPath,
                stringy,
                forecastAuthToken,
                forecastAccountId,
                false
              );
            }
          });
        });
      });
  },
  bambooResponse: async function() {
    try {
      let http_promise = this.makeGetBambooRequest();
      let response_body = await http_promise;
      let d = ical2json.convert(response_body);
      let jsonContennt = d.VCALENDAR[0].VEVENT;
      let data = JSON.stringify(jsonContennt);
      //fs.writeFileSync("bro.json", data);
      return JSON.parse(data);
    } catch (error) {
      console.log(error);
    }
  },
  run: async function() {
    await this.bambooResponse().then(res => {
      this.makeGetForecastRequest(
        urlPeople,
        apiPeoplePath,
        forecastAuthToken,
        forecastAccountId,
        true,
        res
      );
    });
  },
  makePostForecastRequest: function(
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
  },
  postForecastPeople: function() {
    utils.getJsonFile().then(array => {
      let arrayLength = array.length;
      let namesArray = [];

      for (let index = 0; index < arrayLength; index++) {
        let first_name = utils.getFirstWord(array[index].SUMMARY);
        let second_name = utils.getSecondWord(array[index].SUMMARY);
        let fullName = first_name + second_name;
        let names = namesArray.indexOf(fullName);
        let postData = this.makePutPeolpleBody(first_name, second_name);

        if (names === -1) {
          this.makePostForecastRequest(
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
  },

  makePutPeolpleBody: function(first_name, last_name) {
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
};

// function makeDeleteForecastRequest(url, path, authToken, accountId) {
//   fetch(url, {
//     method: "DELETE",
//     headers: headers.makeHeaders(path, authToken, accountId)
//   })
//     .then(res => res.json())
//     .then(json => console.log(json));
// }

// function getDeleteData() {
//   let rawdata = fs.readFileSync("testDeleteData.json");
//   let delData = JSON.parse(rawdata);

//   for (let index = 0; index < delData.length; index++) {
//     const id = delData[index].assignment.id;
//     console.log(id);
//     let delUrl = `https://api.forecastapp.com/assignments/${id}`;
//     let delPath = `/assignments/${id}`;
//     try {
//       makeDeleteForecastRequest(
//         delUrl,
//         delPath,
//         forecastAuthToken,
//         forecastAccountId
//       );
//     } catch (err) {
//       console.log(err);
//     }
//   }
// }

// function deletePeople() {
//   let rawdata = fs.readFileSync("peopletoDelete.json");
//   let delData = JSON.parse(rawdata);

//   for (let index = 0; index < delData.length; index++) {
//     const id = delData[index].person.id;
//     console.log(id);
//     let delUrl = `https://api.forecastapp.com/people/${id}`;
//     let delPath = `/people/${id}`;
//     try {
//       makeDeleteForecastRequest(
//         delUrl,
//         delPath,
//         forecastAuthToken,
//         forecastAccountId
//       );
//     } catch (err) {
//       console.log(err);
//     }
//   }
// }
