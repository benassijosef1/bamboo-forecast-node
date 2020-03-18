const bamboo = require("./bamboo");
const utils = require("./utils");
const config = require("../config/config");
module.exports = {
  sortType: async function(func, arr, string, key) {
    let array = arr;
    let result = await func(array, string, key);
    return result;
  },
  createForecastKeyMap: function(peopleArray) {
    let nameAndIdMap = new Map();
    peopleArray.map(response => {
      nameAndIdMap.set(response.fullName, response.id);
    });
    return nameAndIdMap;
  },
  assignForecastId: function(map, name) {
    return map.get(name);
  },
  setAssignmentsToPost: async function(array, json) {
    let genkey = this.createForecastKeyMap(this.genForePeople(json));
    return new Promise(resolve => {
      let assigments = array.map(element => {
        let name = utils.getFirstTwoWords(
          utils.splitString(element[`${bamboo.summary}`])
        );
        let person = {
          assignment: {
            start_date: utils.spiltDate(element["DTSTART;VALUE=DATE"]),
            end_date: utils.spiltDate(
              bamboo.getBambooEndDate(
                element.DESCRIPTION,
                element["DTEND;VALUE=DATE"]
              )
            ),
            allocation: null,
            active_on_days_off: false,
            repeated_assignment_set_id: null,
            project_id: config.keys.projectId,
            person_id: this.assignForecastId(genkey, name),
            placeholder_id: null
          }
        };

        if (
          person.assignment.person_id != null ||
          person.assignment.person_id != undefined
        ) {
          return person;
        }
      });

      resolve(assigments);
    });
  },
  getAssignmentsToPost: async function(array, json) {
    try {
      let post = await this.setAssignmentsToPost(array, json);
      return post;
    } catch (err) {
      console.log(err);
    }
  },
  genForePeople: function(json) {
    let arr = json.people;
    let people = arr.map(res => {
      return {
        id: res.id,
        fullName: res.first_name + " " + res.last_name
      };
    });
    return people;
  }
};
