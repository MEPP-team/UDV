//Components
import { RequestService } from "../../Components/Request/RequestService";

import { DocumentService, DocumentSource } from "./Model/DocumentService";
import { DocumentProvider } from "./ViewModel/DocumentProvider";
import { DocumentView } from "./View/DocumentView";

/**
 * The entry point of the documents module.
 */
export class DocumentModule {
  /**
   * Creates a new documents module.
   *
   * @param {RequestService} requestService The request service.
   * @param {object} config The configuration of UD-Viz.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   * @param {string} config.server.file The route for document files.
   */
  constructor(requestService, config) {
    /**
     * The document service holds the list of documents fetched from the
     * server.
     *
     * @type {DocumentService}
     */
    this.service = new DocumentService(requestService, config);

    /**
     * The document provider filters the list of documents.
     *
     * @type {DocumentProvider}
     */
    this.provider = new DocumentProvider(this.service);

    /**
     * The document view represents the user interface for the documents.
     *
     * @type {DocumentView}
     */
    this.view = new DocumentView(this.provider);
  }

  ///////////////
  ///// EXTENSION

  /**
   * Adds a new window to display information about documents.
   *
   * @param {AbstractDocumentWindow} newWindow The window to add.
   */
  addDocumentWindow(newWindow) {
    this.view.addDocumentWindow(newWindow);
  }

  /**
   * Creates a new extension for the document browser. An extension can be
   * either a command button or a panel. An extension should be identified by
   * a unique label.
   *
   * @param {string} label The button label.
   * @param {object} options The extension options
   * @param {string} options.type The type of the option. Can be either `button`
   * or `panel`.
   * @param {string} [options.container] The parent element to place the
   * extension in the window. For buttons, the position can be either `left`
   * or `right`.
   * @param {string} options.html The inside HTML of the
   * extension. For a button, this will be the displayed text. For a panel, it
   * will be the inside HTML.
   * @param {(doc: Document) => any} [options.callback] The callback to call
   * for a button.
   */
  addInspectorExtension(label, options) {
    this.view.inspectorWindow.addExtension(label, options)
  }

  /**
   * Removes an existing extension in the browser window.
   *
   * @param {string} label The extension label.
   */
  removeBrowserExtension(label) {
    this.view.inspectorWindow.removeExtension(label);
  }

  /**
   * Creates a new extension for the document search. An extension can be
   * either a command button or a panel. An extension should be identified by
   * a unique label.
   *
   * @param {string} label The extension label.
   * @param {object} options The extension options
   * @param {string} options.type The type of the option. Can be either `button`
   * or `panel`.
   * @param {string} [options.container] The parent element to place the
   * extension in the window. For panels, the position can be either `filter`
   * or `bottom`.
   * @param {string} options.html The inside HTML of the
   * extension. For a button, this will be the displayed text. For a panel, it
   * will be the inside HTML.
   * @param {(doc: Document[]) => any} [options.callback] The callback to call
   * for a button.
   */
  addNavigatorExtension(label, options) {
    this.view.navigatorWindow.addExtension(label, options);
  }

  /**
   * Removes an existing extension in the search window.
   *
   * @param {string} label The extension label.
   */
  removeSearchWindowExtension(label) {
    this.view.navigatorWindow.removeExtension(label);
  }

  /**
   * Changes the document source (the object representing the server URLs
   * to fetch the documents).
   *
   * @param {DocumentSource} newSource The new document source.
   * @param {boolean} [authenticate] Specifies wether authentication should be
   * used for the document fetch requests.
   *
   * @returns {DocumentSource} The previous document source.
   */
  changeDocumentSource(newSource, authenticate) {
    return this.provider.service.setSource(newSource, authenticate);
  }

  /**
   * Adds a filter to the filtering pipeline.
   *
   * @param {DocumentFilter} filter The new filter to add.
   */
  addFilter(filter) {
    this.provider.addFilter(filter);
  }

  /**
   * Adds an event listener to the document provider. There are two types
   * of events :
   * - `DocumentModule.EVENT_FILTERED_DOCUMENTS_UPDATED` fires when the list
   * of filtered documents changes
   * - `DocumentModule.EVENT_DISPLAYED_DOC_CHANGED` fires when the displayed
   * document changes.
   *
   * @param {string} event The event to register. Can only be
   * `DocumentModule.EVENT_FILTERED_DOCS_UPDATED` or
   * `DocumentModule.EVENT_DISPLAYED_DOC_CHANGED`
   * @param {(data: any) => any} action The listener.
   */
  addEventListener(event, action) {
    this.provider.addEventListener(event, action);
  }

  /**
   * Removes an event listener from the document provider.
   *
   * @param {(data: any) => data} action The listener to remove.
   */
  removeEventListener(action) {
    this.provider.removeEventListener(action);
  }

  static get EVENT_FILTERED_DOCS_UPDATED() {
    return DocumentProvider.EVENT_FILTERED_DOCS_UPDATED;
  }

  static get EVENT_DISPLAYED_DOC_CHANGED() {
    return DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED;
  }

  /**
   * Updates the filtered documents list by fetching them from the
   * `DocumentService` and applying the successive filters. Triggers the
   * `DOCUMENT_LIST_UPDATED` and then the `DISPLAYED_DOCUMENT_CHANGED` events.
   */
  async refreshDocumentList() {
    await this.provider.refreshDocumentList();
  }
}
