import { DocumentFilter } from "./DocumentFilter";
import { Document } from "../Model/Document";

/**
 * A document filter to use with the search window. It filters the documents
 * depending on some of their attributes (keywords for title and description,
 * source, rights holder, publication and refering dates).
 */
export class DocumentSearchFilter extends DocumentFilter {
  /**
   * Creates a new document search filter.
   */
  constructor() {
    super((doc) => this.filterDocument(doc));
    // The filter function is our 'filterDocument' method.

    /**
     * A list of keywords to search in the title or the description of the
     * document. These keywords should be in lowercase.
     * 
     * @type {Array<string>}
     */
    this.keywords = [];

    /**
     * A string representing the source. Should be in lowercase.
     * 
     * @type {string}
     */
    this.source = undefined;

    /**
     * The rights holder. Should be in lowercase.
     */
    this.rightsHolder = undefined;

    /**
     * The lower bound of the publication date.
     * 
     * @type {Date}
     */
    this.pubStartDate = undefined;

    /**
     * The upper bound of the publication date.
     * 
     * @type {Date}
     */
    this.pubEndDate = undefined;

    /**
     * The lower bound of the refering date.
     * 
     * @type {Date}
     */
    this.refStartDate = undefined;

    /**
     * The upper bound of the refering date.
     * 
     * @type {Date}
     */
    this.refEndDate = undefined;
  }

  /**
   * The function to filter the documents.
   * 
   * @param {Document} doc The document to filter.
   */
  filterDocument(doc) {
    if (this.keywords.length > 0) {
      for (let keyword of this.keywords) {
        if (!doc.title.toLowerCase().includes(keyword) &&
          !doc.description.toLowerCase().includes(keyword)) {
          return false;
        }
      }
    }

    if (!!this.source && !doc.source.toLowerCase().includes(this.source)) {
      return false;
    }

    if (!!this.rightsHolder &&
      !doc.rightsHolder.toLowerCase().includes(this.rightsHolder)) {
      return false;
    }

    if (!!this.pubStartDate && !(this.pubStartDate <= new Date(doc.publicationDate))) {
      return false;
    }

    if (!!this.pubEndDate && !(this.pubEndDate >= new Date(doc.publicationDate))) {
      return false;
    }

    if (!!this.refStartDate && !(this.refStartDate <= new Date(doc.refDate))) {
      return false;
    }

    if (!!this.refEndDate && !(this.refEndDate >= new Date(doc.refDate))) {
      return false;
    }
    
    return true;
  }

  /**
   * Clears the filter.
   */
  clear() {
    this.keywords = [];
    this.source = undefined;
    this.rightsHolder = undefined;
    this.pubStartDate = undefined;
    this.pubEndDate = undefined;
    this.refStartDate = undefined;
    this.refEndDate = undefined;
  }
}