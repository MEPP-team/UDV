/**
 * Removes empty fields from a FormData. Useful for update requests that
 * would update those fields to an empty string if they were sent in the
 * body. To check if a value is empty, this function just convert it into
 * a boolean.
 * @param {FormData} formData The form data.
 * @returns The same data, without the fields containing an empty value.
 */
export function removeEmptyValues(formData) {
  let emptyKeys = [];
  formData.forEach((value, key) => {
    if (!value) {
      emptyKeys.push(key)
    }
  });
  emptyKeys.forEach((key) => {
    formData.delete(key);
  });
  return formData;
}

/**
 * Converts the raw content of an array buffer (as retrieved by a GET request
 * on a file) to a data URI. This is required, for example, to display images
 * fetched from the server. As we need authentication headers to retrieve some
 * protected files, we get the raw data dynamically and need to convert it to
 * a data URI do display it.  
 * The basic scheme of the URI is defined in the
 * [RFC 2397](https://tools.ietf.org/html/rfc2397), with the mediaType set to
 * `mimeType` and the raw data converted to base64.
 * @param {ArrayBuffer} arrayBuffer The binary data of the file.
 * @param {String} mimeType The media type. Any type supported by a data URI
 * should work. For images, use `image/png` or `image/jpeg` for instance.
 * @param {Number} chunkSize The size of the chunks used to process the raw
 * data. If you get an exception saying that too many arguments were passed as
 * parameters, try reducing this value.
 */
export function imageToDataURI(arrayBuffer, mimeType, chunkSize = 8 * 1024) {
  // The response is a raw file, we need to convert it to base64
  // File (ArrayBuffer) -> Byte array -> String -> Base64 string
  let responseArray = new Uint8Array(arrayBuffer);

  // Make a string from the response array. As the array can be
  // too long (each value will be passed as an argument to
  // String.fromCharCode), we need to split it into chunks
  let responseAsString = '';
  for (let i = 0; i < responseArray.length / chunkSize; i++) {
    responseAsString += String.fromCharCode.apply(null,
      responseArray.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  let b64data = 'data:' + mimeType
              + ';base64,' + btoa(responseAsString);
  return b64data;
}

/**
 * Gets an attribute of an object from the given path. To get nested attributes,
 * the path qualifiers must be separated by dots ('.'). If the path is not
 * nested (does not contain any dot), the function is equivalent to `obj[path]`.
 * 
 * 
 * @param {object} obj 
 * @param {string} path 
 * 
 * @example
 * const obj = {test: {msg: "Hello world !"}};
 * console.log(getAttributeByPath(obj, "test.msg")); // prints "Hello world !";
 * console.log(getAttributeByPath(obj, "other")); // undefined
 */
export function getAttributeByPath(obj, path) {
  const segs = path.split('.');
  let val = obj;
  for (let seg of segs) {
    val = val[seg];
    if (val === undefined) {
      break;
    }
  }
  return val;
}

/**
 * Checks the equality of two objects by their properties. For two objects to
 * be equal, they must have the same keys and the same values.
 * 
 * @param {any} a An object.
 * @param {any} b An object.
 */
export function objectEquals(a, b) {
  // Set of a's keys
  let keys = new Set(Object.keys(a));
  for (let key of Object.keys(b)) {
  	if (!keys.has(key)) {
      // If b has a key unknown to a, they aren't equal
    	return false;
    }
  }
  for (let key of keys) {
    // For each key of a, b must also have the key and the values must be equal
    if (b[key] === undefined || a[key] !== b[key]) {
    	return false;
    }
  }
  return true;
};