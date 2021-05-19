import { Document } from "../Model/Document";

/**
 * A filter for documents. It is essentially a function that determines if a
 * document is acceptable or not.
 */
export class DocumentFilter {
  /**
   * Constructs a new document filter, from an acceptation function.
   * 
   * @param {(Document) => boolean} accepts The function responsible to filter
   * the documents. It must evaluate wether a document is acceptable according
   * to the filter.
   */
  constructor(accepts) {
    /**
     * The function responsible to filter the documents. It must evaluate wether
     * a document is acceptable according to the filter.
     * 
     * @type {(Document) => boolean}
     */
    this.accepts = accepts;
  }

  /**
   * Applies the filter to the documents.
   * 
   * @param {Array<Document>} documents The documents to filter.
   * 
   * @returns {Array<Document>}
   */
  apply(documents) {
    let filtered = documents.filter(this.accepts);
    return filtered;
  }
}