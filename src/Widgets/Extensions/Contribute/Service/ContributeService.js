//Widgets
import { DocumentProvider } from "../../../Documents/ViewModel/DocumentProvider";
import { Document } from "../../../Documents/Model/Document";

//Components
import { RequestService } from "../../../../Components/Request/RequestService";

/**
 * This class performs the requests on the server to update and create
 * documents.
 */
export class ContributeService {
  /**
   * Creates a contribute service.
   *
   * @param {RequestService} requestService The request service.
   * @param {DocumentProvider} provider The document provider.
   * @param {object} config The UD-Viz config.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   */
  constructor(requestService, provider, config) {
    /**
     * The request service.
     *
     * @type {RequestService}
     */
    this.requestService = requestService;

    /**
     * The document provider.
     *
     * @type {DocumentProvider}
     */
    this.provider = provider;

    /**
     * The UD-Viz configuration.
     *
     * @type {{
     *  server: {
     *    url: string,
     *    document: string
     *  }
     * }}
     */
    this.config = config;

    /**
     * The base URL for documents.
     *
     * @type {string}
     */
    this.documentUrl = this.config.server.url;
    if (!this.documentUrl.endsWith('/')) {
      this.documentUrl += '/';
    }
    this.documentUrl += this.config.server.document;
  }

  /**
   * Sends the request to update the document.
   *
   * @param {FormData} updatedData The updated document data.
   *
   * @returns {Document} The updated document.
   */
  async updateDocument(updatedData) {
    //get current doc data and id
    let currentDoc = this.provider.getDisplayedDocument();
    let id = currentDoc.id;

    let url = this.documentUrl + '/' + id;

    let response = await this.requestService.request('PUT', url, {
      body: updatedData
    });

    if (response.status >= 200 && response.status < 300) {
      let updated = JSON.parse(response.responseText);
      await this.provider.refreshDocumentList();
      this.provider.setDisplayedDocument(updated);
      return updated;
    } else {
      throw response.statusText;
    }
  }

  /**
   * Sends the request to create the document.
   *
   * @param {FormData} creationData The document data.
   *
   * @returns {Document} The created document.
   */
  async createDocument(creationData) {
    let response = await (this.requestService.request('POST', this.documentUrl, {
      body: creationData
    }));

    if (response.status >= 200 && response.status < 300) {
      let created = JSON.parse(response.responseText);
      await this.provider.refreshDocumentList();
      return created;
    } else {
      throw response.statusText;
    }
  }

  /**
   * Sends the request to delete the current document.
   */
  async deleteDocument() {
    let currentDoc = this.provider.getDisplayedDocument();
    let id = currentDoc.id;

    let url = this.documentUrl + '/' + id;

    let response = await this.requestService.request('DELETE', url);

    if (response.status >= 200 && response.status < 300) {
      await this.provider.refreshDocumentList();
      return;
    } else {
      throw response.statusText;
    }
  }
}
