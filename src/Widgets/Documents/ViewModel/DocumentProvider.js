//Components
import { EventSender } from "../../../Components/Events/EventSender";

import { DocumentService } from "../Model/DocumentService";
import { Document } from "../Model/Document";
import { DocumentFilter } from "./DocumentFilter";

/**
 * Represents the set of documents that is displayed in the view. This includes
 * the list of filtered documents, as well as the currently displayed one. It
 * uses a `DocumentService` to retrieve documents from the server. It also emits
 * events when the filtered documents, or the currently displayed document
 * change.
 */
export class DocumentProvider extends EventSender {
  /**
   * Constructs a new documents provider.
   * 
   * @param {DocumentService} service The document service.
   */
  constructor(service) {
    super();

    /**
     * The document service.
     * 
     * @type {DocumentService}
     */
    this.service = service;

    /**
     * The list of filters.
     * 
     * @type {Array<DocumentFilter>}
     */
    this.filters = [];

    /**
     * The list of all documents.
     * 
     * @type {Array<Document>}
     */
    this.allDocuments = [];

    /**
     * The list of filtered documents.
     * 
     * @type {Array<Document>}
     */
    this.filteredDocuments = [];

    /**
     * The currently displayed document.
     * 
     * @type {number}
     */
    this.displayedDocumentIndex = undefined;

    this.registerEvent(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED);
    this.registerEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED);
  }

  /**
   * Updates the filtered documents list by fetching them from the
   * `DocumentService` and applying the successive filters. Triggers the
   * `DOCUMENT_LIST_UPDATED` and then the `DISPLAYED_DOCUMENT_CHANGED` events.
   */
  async refreshDocumentList() {
    let previousDocument = this.getDisplayedDocument();
    this.allDocuments = await this.service.fetchDocuments();
    this.filteredDocuments = this.allDocuments.slice();

    for (let filter of this.filters) {
      this.filteredDocuments = filter.apply(this.filteredDocuments);
    }

    if (this.filteredDocuments.length > 0) {
      if (previousDocument) {
        let previousDisplayedId = previousDocument.id;
        let newIndex = this.filteredDocuments.findIndex(doc =>
          doc.id === previousDisplayedId);
        this.displayedDocumentIndex = (newIndex >= 0) ? newIndex : 0;
      } else {
        this.displayedDocumentIndex = 0;
      }
    } else {
      this.displayedDocumentIndex = undefined;
    }
    await this.sendEvent(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED,
      this.getFilteredDocuments());
    await this.sendEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      this.getDisplayedDocument());
  }

  /**
   * Adds a filter to the filtering pipeline.
   * 
   * @param {DocumentFilter} newFilter The new filter to add.
   */
  addFilter(newFilter) {
    if (! (newFilter instanceof DocumentFilter)) {
      throw 'addFilter() expects a DocumentFilter parameter';
    }
    this.filters.push(newFilter);
  }

  /**
   * Sets the given document as the displayed one.
   * 
   * @param {Document} doc The document.
   */
  setDisplayedDocument(doc) {
    let index = this.filteredDocuments.findIndex((filteredDoc) =>
      doc.id === filteredDoc.id);

    if (index < 0) {
      throw 'Document not found.';
    }

    this.setDisplayedDocumentIndex(index);
  }

  /**
   * Change the displayed document index. Sends a `DISPLAYED_DOCUMENT_CHANGED`
   * event.
   * 
   * @param {number} index The new document index.
   */
  setDisplayedDocumentIndex(index) {
    if (this.displayedDocumentIndex === undefined) {
      console.warn('Cannot change displayed document if no document is present');
      return;
    }

    if (index < 0 || index >= this.filteredDocuments.length) {
      throw 'Document index out of bounds : ' + index;
    }

    this.displayedDocumentIndex = index;
    this.sendEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      this.getDisplayedDocument());
  }

  /**
   * Shift the displayed document index.  The filtered array is treated as
   * cyclical. Sends a `DISPLAYED_DOCUMENT_CHANGED` event.
   * 
   * @param {number} offset The offset that will be applied to the current
   * index.
   */
  shiftDisplayedDocumentIndex(offset) {
    if (this.displayedDocumentIndex === undefined) {
      console.warn('Cannot change displayed document if no document is present');
      return;
    }

    offset = offset % this.filteredDocuments.length;
    this.displayedDocumentIndex = (this.filteredDocuments.length +
      this.displayedDocumentIndex + offset) % this.filteredDocuments.length;
    
    this.sendEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      this.getDisplayedDocument());
  }

  /**
   * Returns the list of all documents.
   * 
   * @returns {Array<Document>}
   */
  getAllDocuments() {
    return this.allDocuments;
  }

  /**
   * Returns the filtered list of documents.
   * 
   * @returns {Array<Document>}
   */
  getFilteredDocuments() {
    return this.filteredDocuments;
  }

  /**
   * Returns the currently displayed document.
   * 
   * @returns {Document | undefined}
   */
  getDisplayedDocument() {
    if (this.displayedDocumentIndex === undefined) {
      return undefined;
    }

    return this.filteredDocuments[this.displayedDocumentIndex];
  }

  /**
   * Returns the displayed document index.
   * 
   * @returns {number | undefined}
   */
  getDisplayedDocumentIndex() {
    return this.displayedDocumentIndex;
  }

  /**
   * Returns the image corresponding to the displayed document. It is a string
   * that can be put into the `src` attribute of an `img` tag (so either an
   * URL or a base64 encoded file).
   * 
   * @async
   * 
   * @returns {Promise<string | undefined>}
   */
  async getDisplayedDocumentImage() {
    if (this.displayedDocumentIndex === undefined) {
      return undefined;
    }

    return await this.service.fetchDocumentImage(this.getDisplayedDocument());
  }

  ////////////
  ///// EVENTS

  static get EVENT_FILTERED_DOCS_UPDATED() {
    return 'EVENT_FILTERED_DOCS_UPDATED';
  }

  static get EVENT_DISPLAYED_DOC_CHANGED() {
    return 'EVENT_DISPLAYED_DOC_CHANGED';
  }
}