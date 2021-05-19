/** @format */

const Type = require('./Type');

module.exports = {
  overWrite(jsonOverWrited, jsonModel) {
    const traverse = function (json1, json2) {
      for (let key in json1) {
        if (json1[key] instanceof Object) {
          if (json2[key] instanceof Object) traverse(json1[key], json2[key]);
        } else {
          if (json2[key] != undefined) {
            json1[key] = json2[key];
            console.log('overwrite ', json1);
          }
        }
      }
    };

    traverse(jsonOverWrited, jsonModel);
  },

  parseNumeric(json) {
    const parse = function (j) {
      for (let key in j) {
        if (j[key] instanceof Object) {
          parse(j[key]);
        } else if (Type.isNumeric(j[key])) {
          //console.log(j[key]);
          j[key] = parseFloat(j[key]);
          //console.log(j[key]);
        }
      }
    };

    return parse(json);
  },
};
