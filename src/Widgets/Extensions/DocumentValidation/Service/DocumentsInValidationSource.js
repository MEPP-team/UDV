import { DocumentSource } from "../../../Documents/Model/DocumentService";

/**
 * The document source for documents in validation.
 */
export class DocumentsInValidationDocumentSource extends DocumentSource {
  /**
   * Creates the document source.
   * 
   * @param {object} config The UD-Viz configuration.
   * @param {object} config.server The configuration for the server.
   * @param {string} config.server.url The base URL of the server.
   * @param {string} config.server.documentToValidate The route to fetch
   * documents to validate.
   * @param {string} config.server.document The route to fetch documents.
   * @param {string} config.server.file The route for document files.
   */
  constructor(config) {
    super();
    this.documentToValidateUrl = `${config.server.url}${config.server.documentToValidate}`;
    this.documentUrl = `${config.server.url}${config.server.document}`;
    this.fileRoute = config.server.file;
  }

  getDocumentUrl() {
    return this.documentToValidateUrl;
  }

  getImageUrl(doc) {
    return this.documentUrl + '/' + doc.id + '/' + this.fileRoute;
  }
}