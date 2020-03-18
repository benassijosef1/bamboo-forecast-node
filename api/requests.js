const config = require("../config/config");
const forecast = require("../functions/forecast");
const bamboo = require("../functions/bamboo");
const headers = require("./headers");
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
    response
  ) {
    fetch(url, {
      method: "GET",
      headers: headers.makeHeaders(path, authToken, accountId, boolean)
    })
      .then(res => res.json())
      .then(json => {
        forecast
          .sortType(bamboo.sortByOffType, response, offType, bamboo.summary)
          .then(res => {
            forecast.getAssignmentsToPost(res, json).then(res => {
              res.map(element => {
                let stringy = JSON.stringify(element);
                console.log(stringy);
                // this.makePostForecastRequest(
                //   urlTimeOffPut,
                //   apiTimeOffPath,
                //   stringy,
                //   forecastAuthToken,
                //   forecastAccountId,
                //   false
                // );
              });
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
  postForecastPeople: function(file) {
    utils.getJsonFile(file).then(array => {
      let arrayLength = array.length;
      let namesArray = [];

      for (let index = 0; index < arrayLength; index++) {
        let first_name = utils.getFirstWord(array[index][`${bamboo.summary}`]);
        let second_name = utils.getSecondWord(
          array[index][`${bamboo.summary}`]
        );
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
