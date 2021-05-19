//Components
import { RequestService } from "../../../../Components/Request/RequestService";
import { getAttributeByPath } from "../../../../Components/DataProcessing/DataProcessing";

export class GeocodingService {
  /**
   * Instantiates the geocoding service.
   *
   * @param {RequestService} requestService The request service.
   * @param {*} extent The iTwons extent.
   * @param {*} config Global configuration.
   */
  constructor(requestService, extent, config) {
    this.requestService = requestService;
    this.extent = extent.as('EPSG:4326');
    this.geocodingUrl = config.geocoding.url;
    this.parameters = config.geocoding.parameters;
    this.basePath = config.geocoding.basePath;
    this.latPath = config.geocoding.result.lat;
    this.lngPath = config.geocoding.result.lng;
    this.credit = config.geocoding.credit;
    this.requestTimeIntervalMs = config.geocoding.requestTimeIntervalMs;
    this.canDoRequest = true;
  }

  /**
   * Retrieves the coordinates based on the search string parameter.
   *
   * @param {String} searchString Either an address or the name of a place.
   */
  async getCoordinates(searchString) {
    if ((!!this.requestTimeIntervalMs) && !this.canDoRequest) {
      throw 'Cannot perform a request for now.';
    }

    //URL parameters
    const queryString = encodeURIComponent(searchString);

    //build the URL according to parameter description (in config file)
    let url = this.geocodingUrl + '?';
    for (let [paramName, param] of Object.entries(this.parameters)) {
      if (param.fill === "value") {
        url += `${paramName}=${param.value}`;
      } else if (param.fill === "query") {
        url += `${paramName}=${queryString}`;
      } else if (param.fill === "extent") {
        url += paramName + '=' + param.format
          .replace('SOUTH', this.extent.south)
          .replace('WEST', this.extent.west)
          .replace('NORTH', this.extent.north)
          .replace('EAST', this.extent.east);
      }
      url += "&";
    }

    //make the request
    const req = await this.requestService.request('GET', url, {
      authenticate: false
    });
    const response = JSON.parse(req.response);
    const results = ((!!this.basePath) ? response[this.basePath] : response)
      .map(res => {
        return {
          lat: Number(getAttributeByPath(res, this.latPath)),
          lng: Number(getAttributeByPath(res, this.lngPath))
        };
      });

    if (!!this.requestTimeIntervalMs) {
      this.canDoRequest = false;
      setTimeout(() => {
        this.canDoRequest = true;
      }, Number(this.requestTimeIntervalMs));
    }

    if (results.length > 0) {
      return results;
    } else {
      throw 'No result found';
    }
  }
}
