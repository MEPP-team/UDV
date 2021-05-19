/** @format */

module.exports = {
  //https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
  isNumeric(str) {
    if (str === 0) return true; //diff
    if (str instanceof Object) return false;
    if (typeof str == 'boolean') return false;

    return (
      !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  },
};
