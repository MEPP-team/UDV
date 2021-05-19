# Geocoding module

The purpose of the geocoding module is to navigate through the city by entering addresses or place names.

## Module description

The module view adds a search bar to the main content div, centered at the top. The user can type a query (example: "Basilique Fourvière"), then the module will geocode this query and display the results in the view by adding pins and moving the camera.

## Installation and configuration

### Installation

To install the module in your demo, you must first create the service and then the view.

The service takes 3 parameters : a `RequestService` used to perform the REST call, the view extent and the global configuration (both provided by the `BaseDemo`).

The view takes the service as a first parameter, but also takes two arguments from `BaseDemo` : the camera controls and the view.

The view can then be added in the `BaseDemo`.

```js
const geocodingService = new udvcore.GeocodingService(requestService, baseDemo.extent, baseDemo.config);
const geocodingView = new udvcore.GeocodingView(geocodingService, baseDemo.controls, baseDemo.view);

// You can specify a more explicit name than 'geocoding' for the menu button
baseDemo.addModuleView('geocoding', geocodingView, {name: 'Address search'});
```

### Configuration

The geocoding module will use REST calls to a web service to compute coordinates from query strings. The module was tested with three different services ([Google](https://developers.google.com/maps/documentation/geocoding/start), [OpenCage](https://opencagedata.com/api) and [Nominatim](https://nominatim.openstreetmap.org/)), and is theoritically compatible with most service providers. In order to configure the module, you should specify informations about the web service you want to call. This information includes :

- URL of the geocoding service endpoint
- URL parameters to add to the request
- Credit to the service provider
- Description of the result.

The configuration file must have the following structure :

```json
{
  "type": "class",
  "geocoding":{
    "url":"",
    "credit": "© ...",
    "requestTimeIntervalMs": "",
    "result":{
      "format": "json",
      "basePath": "",
      "lng": "",
      "lat": ""
    },
    "parameters":{
      "param_name_1":{
        "fill": "value",
        "optional": "",
        "value": ""
      },
      "param_name_2":{
        "fill": "",
        "optional": "",
      },
      "param_name_n":{
        "fill": "",
        "optional": "",
      },
    }
  }
}
```

The `url` field represents the base URL of geocoding requests. For example, to use the Google API services, https://maps.googleapis.com/maps/api/geocode/json is the base URL.

The `credit` field is the string that will be displayed under the search bar in the web application. It is used to clearly display attribution for the third party service. For OpenStreetMap's Nominatim for example, you should use "© OpenStreetMap contributors" as specified on their [copyright page](https://www.openstreetmap.org/copyright).

The `requestTimeIntervalMs` is an optional parameter used to specify a minimal time interval between requests (value must be a number of milliseconds). It can be used to avoid doing too many requests to a server in a short time. For example, the usage policy of Nominatim specifies that an application is allowed to make at most one request per second.

The `result` object describes how the result should be interpreted. The goal is for the geocoding service to find the different geographical coordinates from the query's response. It assumes that the response will be a json object which either is or contains an array of results. It will search for the array in the `basePath` attribute path (nested attributes should be separated by dots). If the response itself is an array, `basePath` should be an empty string.  
The two other fields, `lat` and `lng`, specify the path of the coordinates in each array item.

The `parameters` dictionary represents query parameters that will be added to the URL to perform the appropriate geocoding request. Each parameter is described as a `"name": descriptor` pair, where `name` will be the name of the parameter in the request and `descriptor` describes how the value will be filled. To do that, the descriptor must contain a field named `fill` which can take 3 different values :

|Fill value|Description|
|----------|------|
|`"value"`|Fills the parameter with a given value. The value is specified in the `value` field of the descriptor.|
|`"query"`|Fills the parameter with the query string, formatted as a URI component.|
|`"extent"`|Fills the parameter with the extent bounds, with EPSG:4326 coordinates. The string format is specified by the `format` field of the descriptor, which is a string in which the substrings `SOUTH`, `WEST`, `NORTH` and `EAST` will be replaced with the corresponding coordinates.|

### Example configuration

An example configuration for the Nominatim service is provided in the `generalDemoConfig.json` file (under `examples/data/config`). You can find a extract below :

```json
"geocoding":{
  "url":"https://nominatim.openstreetmap.org/search",
  "credit": "© OpenStreetMap contributors under <a href=\"https://www.openstreetmap.org/copyright\">ODbL</a>",
  "requestTimeIntervalMs": "1000",
  "result":{
    "format": "json",
    "basePath": "",
    "lng": "lon",
    "lat": "lat"
  },
  "parameters":{
    "q":{
      "fill": "query"
    },
    "format":{
      "fill": "value",
      "value": "json"
    },
    "viewbox":{
      "fill": "extent",
      "format": "WEST,SOUTH,EAST,NORTH"
    }
  }
}
```

With this configuration, the request takes three parameters :

- `q` contains the query string.
- `format` contains the value `json`. It specifies the output format for the Nominatim service.
- `viewbox` sets a result preference extent. As specified on their [api documentation](https://nominatim.org/release-docs/develop/api/Search/), the string must match the following format : `viewbox=<x1>,<y1>,<x2>,<y2>`, which translates to `WEST,SOUTH,EAST,NORTH` in our configuration file.

Here is a sample result of a request for the query "charpennes" (some fields are eluded):

```json
[
  {
    "place_id": 18301952,
    "lat": "45.7711641",
    "lon": "4.8658947",
    ...
  },
  {
    "place_id": 7155630,
    "lat": "45.7701877",
    "lon": "4.8631919",
    ...
  }
]
```

As you can see, the response is a JSON array containing the results, hence the `"basePath": ""` configuration. In each query result, the latitude is stored unter a `lat` field, and the longitude under `lon`. We specify that in our configuration file with `"lat": "lat"` and `"lng": "lon"`.