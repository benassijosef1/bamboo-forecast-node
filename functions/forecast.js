const bamboo = require("./bamboo");
const utils = require("./utils");
const config = require("../config/config");
let nameAndIdMap = new Map();

module.exports = {
  sortType: async function(arr, offType) {
    let array = arr;
    let result = await bamboo.sortByOffType(array, offType);
    return result;
  },
  createForecastKeyMap: function(array) {
    let arrayLength = array.length;
    for (let index = 0; index < arrayLength; index++) {
      let fullName = array[index].firstName + " " + array[index].lastName;
      let id = array[index].forecastId;
      nameAndIdMap.set(fullName, id);
    }
    return nameAndIdMap;
  },
  assignForecastId: function(name) {
    return nameAndIdMap.get(name);
  },
  setAssignmentsToPost: async function(array) {
    return new Promise(resolve => {
      let arrayLength = array.length;
      let assignments = [];

      for (let index = 0; index < arrayLength; index++) {
        const startDate = array[index]["DTSTART;VALUE=DATE"];
        let endDateToFormat = array[index]["DTEND;VALUE=DATE"];

        let summary = array[index].SUMMARY;
        let description = array[index].DESCRIPTION;
        let endDate = bamboo.getBambooEndDate(description, endDateToFormat);
        console.log("summary", summary);
        let name = utils.splitString(summary);
        console.log("name", name);
        let fullName = utils.getFirstTwoWords(name);

        let personPutObject2 = {
          assignment: {
            start_date: utils.spiltDate(startDate),
            end_date: utils.spiltDate(endDate),
            allocation: null,
            active_on_days_off: false,
            repeated_assignment_set_id: null,
            project_id: config.keys.projectId,
            person_id: this.assignForecastId(fullName),
            placeholder_id: null
          }
        };

        if (
          personPutObject2.assignment.person_id != null ||
          personPutObject2.assignment.person_id != undefined
        ) {
          assignments.push(personPutObject2);
        }
      }

      resolve(assignments);
    });
  },
  getAssignmentsToPost: async function(array) {
    try {
      let post = await this.setAssignmentsToPost(array);
      return post;
    } catch (err) {
      console.log(err);
    }
  }
};
