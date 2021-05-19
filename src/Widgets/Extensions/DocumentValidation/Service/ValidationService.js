//Components
import { RequestService } from "../../../../Components/Request/RequestService";

import { Document } from "../../../Documents/Model/Document";

/**
 * This class is responsible for the validation requests.
 */
export class ValidationService {
  /**
   * Constructs a validation service.
   * 
   * @param {RequestService} requestService The request service.
   * @param {object} config The UD-Viz configuration.
   * @param {object} config.server The configuration for the server.
   * @param {string} config.server.url The base URL of the server.
   * @param {string} config.server.validate The route to validating documents.
   */
  constructor(requestService, config) {
    this.requestService = requestService;
    this.validateUrl = `${config.server.url}${config.server.validate}`;
  }

  /**
   * Sends the request to validate the document.
   * 
   * @param {Document} doc The document to validate.
   */
  async validate(doc) {
    let formData = new FormData();
    formData.append('id', doc.id);
    let response = await this.requestService.request('POST', this.validateUrl, {
      body: formData
    });
  };
}