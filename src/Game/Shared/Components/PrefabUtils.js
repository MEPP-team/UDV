/** @format */

const JSONUtils = require('../../../Components/SystemUtils/JSONUtils');

module.exports = {
  parsePrefab(goJSON, manager) {
    console.warn('deprecated ?');
    const parse = function (json, cb) {
      if (json.children instanceof Object) {
        for (let key in json.children) {
          cb(json.children, key);
        }
      }
    };

    parse(goJSON, function (json, key) {
      const value = json[key];

      if (value.prefabId != undefined) {
        const prefabJSON = manager.fetchPrefabJSON(value.prefabId);
        JSONUtils.overWrite(prefabJSON, json);
        json[key] = prefabJSON;
      }
    });

    return goJSON;
  },
};
