//Components
import { RequestService } from "../../../Components/Request/RequestService";
import { imageToDataURI } from "../../../Components/DataProcessing/DataProcessing";

import { Document } from "./Document";

/**
 * This class is responsible of fetching the documents from the server. It is
 * configured by an object containing the server URL and routes.
 */
export class DocumentService {
  /**
   * Constructs a new document service.
   * 
   * @param {RequestService} requestService The request service.
   * @param {object} config The configuration of UD-Viz.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   * @param {string} config.server.file The route for document files.
   * @param {boolean} [config.server.authenticate] If authentication should be
   * used for the request.
   */
  constructor(requestService, config) {
    /**
     * The request service.
     * 
     * @type {RequestService}
     */
    this.requestService = requestService;
    
    /**
     * If authentication should be used for the request.
     * 
     * @type {boolean}
     */
    this.authenticate = false;
    if (config.server.authenticate) {
      this.authenticate = true;
    }

    /**
     * The object that defines the server URLs to fetch documents.
     * 
     * @type {DocumentSource}
     */
    this.source = new DefaultDocumentSource(config);

    /**
     * The list of documents.
     * 
     * @type {Array<Document>}
     */
    this.documents = [];
  }

  /**
   * Sets the source of documents.
   * 
   * @param {DocumentSource} docSource The document source.
   * @param {boolean} [authenticate] Specifies if authentication should be used
   * to fetch documents.
   * 
   * @returns {DocumentSource} The previous source.
   */
  setSource(docSource, authenticate = false) {
    if (! (docSource instanceof DocumentSource)) {
      throw 'The document source must be an instance of DocumentSource';
    }

    this.authenticate = authenticate;

    let previous = this.source;
    this.source = docSource;
    return previous;
  }

  /**
   * Fetches the documents from the server and return them in an array.
   * 
   * @async
   * 
   * @returns {Promise<Array<Document>>}
   */
  async fetchDocuments() {
    let req = await this.requestService.request('GET',
      this.source.getDocumentUrl(), { authenticate: this.authenticate });

    if (req.status !== 200) {
      throw 'Could not fetch the documents: ' + req.statusText;
    }

    this.documents = JSON.parse(req.responseText);

    return this.documents;
  }

  /**
   * Fetches the image corresponding to the given document.
   * 
   * @param {Document} doc The document to fetch the image.
   * 
   * @returns {string} The data string of the image.
   */
  async fetchDocumentImage(doc) {
    let imgUrl = this.source.getImageUrl(doc);
    let req = await this.requestService.request('GET', imgUrl, {
      responseType: 'arraybuffer',
      authenticate: this.authenticate
    });
    if (req.status >= 200 && req.status < 300) {
      return imageToDataURI(req.response,
        req.getResponseHeader('Content-Type'));
    }
    throw 'Could not get the file';
  }
}

/**
 * An object that holds and returns the URLs for documents.
 */
export class DocumentSource {
  constructor() {

  }

  /**
   * Returns the URL to retrieve the documents.
   * 
   * @abstract
   * 
   * @returns {string}
   */
  getDocumentUrl() {
    return '';
  }

  /**
   * Returns the URL to retrieve the image of the document.
   * 
   * @param {Document} doc The document.
   * 
   * @abstract
   * 
   * @returns {string}
   */
  getImageUrl(doc) {
    return '';
  }
}

/**
 * The default document source, built from the application configuration.
 */
class DefaultDocumentSource extends DocumentSource {
  /**
   * 
   * @param {object} config The configuration of UD-Viz.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   * @param {string} config.server.file The route for document files.
   */
  constructor(config) {
    super();

    /**
     * The URL to fetch the documents.
     * 
     * @type {string}
     */
    this.documentUrl;

    /**
     * The route to fetch the document images.
     * 
     * @type {string}
     */
    this.fileRoute;

    if (!!config && !!config.server && !!config.server.url &&
      !!config.server.document && !!config.server.file) {
      this.documentUrl = config.server.url;
      if (this.documentUrl.slice(-1) !== "/") {
        this.documentUrl += "/";
      }
      this.documentUrl += config.server.document;
      this.fileRoute = config.server.file;
    } else {
      throw 'The given configuration is incorrect.';
    }
  }

  getDocumentUrl() {
    return this.documentUrl;
  }

  /**
   * @override
   * 
   * @param {Document} doc The document.
   */
  getImageUrl(doc) {
    return this.documentUrl + '/' + doc.id + '/' + this.fileRoute;
  }
}