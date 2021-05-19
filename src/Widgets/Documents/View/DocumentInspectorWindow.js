import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { Document } from "../Model/Document";
import { AbstractDocumentWindow } from "./AbstractDocumentWindow";

/**
 * The window responsible for displaying the currently displayed document, as
 * defined in the document provider. It also serves as a container to add
 * extension buttons.
 */
export class DocumentInspectorWindow extends AbstractDocumentWindow {
  /**
   * Constructs a documents inspector window.
   */
  constructor() {
    super('Inspector');

    /**
     * Represents a list of extensions. An extension can either be a button or
     * a panel.
     *
     * @type {Object.<string, {
     *  type: 'button' | 'panel',
     *  container?: string,
     *  label: string,
     *  id: string,
     *  callback?: (doc: Document) => any,
     *  html: string
     * }>}
     */
    this.extensions = {};
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">Title: <span id="${this.docTitleId}"></span></h3>
        <div>
          <img class="inspector-doc-img" src="" alt="Document image"
            id="${this.docImageId}" title="CTRL + Click to open the image">
          <input type="checkbox" class="spoiler-check" id="doc-details-spoiler" checked>
          <label for="doc-details-spoiler" class="subsection-title">Details</label>
          <div class="inspector-details spoiler-box" style="max-height: 250px; overflow-y: auto;">
            <p class="inspector-field-title">Description</p>
            <p class="inspector-field" id="${this.docDescriptionId}"></p>
            <p class="inspector-field-title">Refering date</p>
            <p class="inspector-field" id="${this.docRefDateId}"></p>
            <p class="inspector-field-title">Publication date</p>
            <p class="inspector-field" id="${this.docPubDateId}"></p>
            <p class="inspector-field-title">Source</p>
            <p class="inspector-field" id="${this.docSourceId}"></p>
            <p class="inspector-field-title">Rights holder</p>
            <p class="inspector-field" id="${this.docRightsHolderId}"></p>
          </div>
          <div class="inspector-left-right-grid">
            <div data-ext-container="left" class="text-left">
            </div>
            <div data-ext-container="right" class="text-right">
            </div>
          </div>
        </div>
      </div>
      <div data-ext-container="panel"
        data-ext-container-default="div"
        data-ext-class="box-section">

      </div>
    `;
  }

  windowCreated() {
    this.window.style.left = 'unset';
    this.window.style.right = '10px';
    this.window.style.top = '10px';
    this.window.style.width = '390px';

    // Add extensions
    for (let extension of Object.values(this.extensions)) {
      this._createExtensionElement(extension);
    }

    this.docImageElement.onclick = (event) => {
      if (event.ctrlKey) {
        window.open(this.docImageElement.src);
      }
    };
  }

  documentWindowReady() {
    this.provider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this.onDisplayedDocumentChange(doc));
  }

  ///////////////////////
  ///// DOCUMENT HANDLING

  /**
   * Triggered when the displayed document change. Updates the HTML fields.
   *
   * @param {Document} newDocument The new displayed document.
   */
  async onDisplayedDocumentChange(newDocument) {
    if (!newDocument) {
      this._setDefaultFieldValues();
      return;
    }

    this._fillFieldsFromDocument(newDocument);
  }

  /**
   * Sets the default values for the HTML fields.
   */
  _setDefaultFieldValues() {
    this.docTitleElement.innerText = 'No document found';
    this.docDescriptionElement.innerText = '';
    this.docSourceElement.innerText = '';
    this.docRightsHolderElement.innerText = '';
    this.docPubDateElement.innerText = '';
    this.docRefDateElement.innerText = '';
    this.docImageElement.src = '';
  }

  /**
   * Updates the HTML fields so that they describe the new displayed document.
   *
   * @param {Document} newDocument The new displayed document.
   */
  async _fillFieldsFromDocument(newDocument) {
    if (!this.isCreated) {
      return;
    }
    this.docTitleElement.innerText = newDocument.title;
    this.docDescriptionElement.innerText = newDocument.description;
    this.docSourceElement.innerText = newDocument.source;
    this.docRightsHolderElement.innerText = newDocument.rightsHolder;
    this.docPubDateElement.innerText =
      (new Date(newDocument.publicationDate)).toLocaleDateString();
    this.docRefDateElement.innerText =
      (new Date(newDocument.refDate)).toLocaleDateString();
    this.docImageElement.src = await this.provider.getDisplayedDocumentImage();
  }

  /////////////
  ///// GETTERS

  get docTitleId() {
    return `${this.windowId}_title`
  }

  get docTitleElement() {
    return document.getElementById(this.docTitleId);
  }

  get docDescriptionId() {
    return `${this.windowId}_desc`
  }

  get docDescriptionElement() {
    return document.getElementById(this.docDescriptionId);
  }

  get docSourceId() {
    return `${this.windowId}_source`
  }

  get docSourceElement() {
    return document.getElementById(this.docSourceId);
  }

  get docRightsHolderId() {
    return `${this.windowId}_rights_holder`
  }

  get docRightsHolderElement() {
    return document.getElementById(this.docRightsHolderId);
  }

  get docPubDateId() {
    return `${this.windowId}_pub_date`
  }

  get docPubDateElement() {
    return document.getElementById(this.docPubDateId);
  }

  get docRefDateId() {
    return `${this.windowId}_ref_date`
  }

  get docRefDateElement() {
    return document.getElementById(this.docRefDateId);
  }

  get docImageId() {
    return `${this.windowId}_image`;
  }

  get docImageElement() {
    return document.getElementById(this.docImageId);
  }
}
