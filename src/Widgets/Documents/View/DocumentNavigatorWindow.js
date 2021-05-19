import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { Document } from "../Model/Document";
import { DocumentSearchFilter } from "../ViewModel/DocumentSearchFilter";
import { AbstractDocumentWindow } from "./AbstractDocumentWindow";

/**
 * Represents the navigator window for the documents. It contains the filters on
 * the fields of a document.
 */
export class DocumentNavigatorWindow extends AbstractDocumentWindow {
  /**
   * Creates a document navigator window.
   */
  constructor() {
    super('Navigator');

    /**
     * The filter corresponding to the research fields.
     *
     * @type {DocumentSearchFilter}
     */
    this.searchFilter = new DocumentSearchFilter();

    /**
     * Represents a list of extensions. An extension can either be a button or
     * a panel.
     *
     * @type {Object.<string, {
      *  type: 'button' | 'panel',
      *  label: string,
      *  id: string,
      *  callback?: (doc: Document[]) => any,
      *  html: string
      * }>}
      */
     this.extensions = {};
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">
          <span id="${this.docCountId}"></span> Document(s)
        </h3>
        <div class="documents-list">
          <ul id="${this.documentListId}">

          </ul>
        </div>
        <div data-ext-container-default="button">

        </div>
      </div>
      <div class="box-section">
        <input type="checkbox" class="spoiler-check" id="doc-filters-spoiler">
        <label for="doc-filters-spoiler" class="section-title">Filters</label>
        <div class="spoiler-box" id="${this.inputFormId}">
          <div data-ext-container="filter">

          </div>
          <input type="checkbox" class="spoiler-check" id="doc-search-spoiler">
          <label for="doc-search-spoiler" class="subsection-title">Attributes</label>
          <form class="search-form spoiler-box" id="${this.inputFormId}">
            <label for="${this.inputKeywordsId}">Keywords</label>
            <input type="text" id="${this.inputKeywordsId}">
            <label for="${this.inputPubDateStartId}">Publication date</label>
            <div class="date-wrapper">
              <span>From</span><input type="date" id="${this.inputPubDateStartId}"><br>
              <span>To</span><input type="date" id="${this.inputPubDateEndId}">
            </div>
            <label for="${this.inputRefDateStartId}">Refering date</label>
            <div class="date-wrapper">
              <span>From</span><input type="date" id="${this.inputRefDateStartId}"><br>
              <span>To</span><input type="date" id="${this.inputRefDateEndId}">
            </div>
            <label for="${this.inputSourceId}">Source</label>
            <input type="text" id="${this.inputSourceId}">
            <label for="${this.inputRightsHolderId}">Rights holder</label>
            <input type="text" id="${this.inputRightsHolderId}">
            <hr>
            <input type="submit" value="Filter">
            <button id="${this.clearButtonId}">Clear</button>
          </form>
        </div>
      </div>
      <div data-ext-container="bottom" data-ext-container-default="div">
      
      </div>
    `;
  }

  windowCreated() {
    this.window.style.width = '270px';
    this.window.style.top = '10px';
    this.window.style.left = '10px';

    // Add extensions
    for (let extension of Object.values(this.extensions)) {
      this._createExtensionElement(extension);
    }

    this.inputFormElement.onsubmit = () => {
      this.search();
      return false;
    };
    this.clearButtonElement.onclick = () => {
      this.clear();
    };
  }

  documentWindowReady() {
    this.provider.addFilter(this.searchFilter);

    this.provider.addEventListener(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED,
      (documents) => this._onFilteredDocumentsUpdate(documents));
    this.provider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this._onDisplayedDocumentChange(doc));
  }

  //////////////////////////////
  ///// DOCUMENT UPDATE TRIGGERS

  /**
   * Callback triggered when the list of filtered documents changes.
   *
   * @private
   *
   * @param {Array<Document>} documents The new array of filtered documents.
   */
  _onFilteredDocumentsUpdate(documents) {
    if (!this.isCreated) {
      return;
    }

    let list = this.documentListElement;
    list.innerHTML = '';
    for (let doc of documents) {
      let item = document.createElement('li');
      item.innerHTML = /*html*/`
        <div class='doc-title'>${doc.title}</div>
        <div class='doc-info'>Refering ${(new Date(doc.refDate)).toLocaleDateString()}</div>
      `;
      item.classList.add('navigator-result-doc')
      item.onclick = () => {
        this.provider.setDisplayedDocument(doc);
      };
      list.appendChild(item);
    }
    this.docCountElement.innerHTML = documents.length;
  }

  /**
   * Callback triggered when the displayed document changes.
   *
   * @private
   *
   * @param {Document} document The new displayed documents.
   */
  _onDisplayedDocumentChange(document) {
    if (!this.isCreated) {
      return;
    }
    let previouslySelected =
      this.documentListElement.querySelector('.document-selected');
    if (!!previouslySelected) {
      previouslySelected.classList.remove('document-selected');
    }
    if (!!document) {
      let newIndex = this.provider.getDisplayedDocumentIndex();
      let newSelected = this.documentListElement
        .querySelector(`li:nth-child(${newIndex + 1})`);
      newSelected.classList.add('document-selected');
    }
  }


  ////////////////////////
  ///// SEARCH AND FILTERS

  /**
   * Event on the 'search' button click.
   */
  async search() {
    let keywords = this.inputKeywordsElement.value.split(/[ ,;]/)
      .filter((k) => k !== "").map((k) => k.toLowerCase());
    this.searchFilter.keywords = keywords;

    let source = this.inputSourceElement.value.toLowerCase();
    this.searchFilter.source = (source !== "") ? source : undefined;

    let rightsHolder = this.inputRightsHolderElement.value.toLowerCase();
    this.searchFilter.rightsHolder = (rightsHolder !== "") ? rightsHolder
      : undefined;

    let pubStartDate = this.inputPubDateStartElement.value;
    this.searchFilter.pubStartDate = (!!pubStartDate) ? new Date(pubStartDate)
      : undefined;

    let pubEndDate = this.inputPubDateEndElement.value;
    this.searchFilter.pubEndDate = (!!pubEndDate) ? new Date(pubEndDate)
      : undefined;

    let refStartDate = this.inputRefDateStartElement.value;
    this.searchFilter.refStartDate = (!!refStartDate) ? new Date(refStartDate)
      : undefined;

    let refEndDate = this.inputRefDateEndElement.value;
    this.searchFilter.refEndDate = (!!refEndDate) ? new Date(refEndDate)
      : undefined;

    this.provider.refreshDocumentList();
  }

  /**
   * Clears the research fields.
   */
  clear() {
    this.inputSourceElement.value = '';
    this.inputRightsHolderElement.value = '';
    this.inputKeywordsElement.value = '';
    this.inputRefDateEndElement.value = '';
    this.inputRefDateStartElement.value = '';
    this.inputPubDateEndElement.value = '';
    this.inputPubDateStartElement.value = '';
    this.provider.refreshDocumentList();
  }

  ////////////
  //// GETTERS

  get inputFormId() {
    return `${this.windowId}_form`;
  }

  get inputFormElement() {
    return document.getElementById(this.inputFormId);
  }

  get clearButtonId() {
    return `${this.windowId}_button_clear`;
  }

  get clearButtonElement() {
    return document.getElementById(this.clearButtonId);
  }

  get documentListId() {
    return `${this.windowId}_document_list`;
  }

  get documentListElement() {
    return document.getElementById(this.documentListId);
  }

  get inputKeywordsId() {
    return `${this.windowId}_input_Keywords`;
  }

  get inputKeywordsElement() {
    return document.getElementById(this.inputKeywordsId);
  }

  get inputSourceId() {
    return `${this.windowId}_input_Source`;
  }

  get inputSourceElement() {
    return document.getElementById(this.inputSourceId);
  }

  get inputRightsHolderId() {
    return `${this.windowId}_rights_holder`
  }

  get inputRightsHolderElement() {
    return document.getElementById(this.inputRightsHolderId);
  }

  get inputPubDateStartId() {
    return `${this.windowId}_input_Publication`;
  }

  get inputPubDateStartElement() {
    return document.getElementById(this.inputPubDateStartId);
  }

  get inputPubDateEndId() {
    return `${this.windowId}_input_Publication_End`;
  }

  get inputPubDateEndElement() {
    return document.getElementById(this.inputPubDateEndId);
  }

  get inputRefDateStartId() {
    return `${this.windowId}_input_Reference`;
  }

  get inputRefDateStartElement() {
    return document.getElementById(this.inputRefDateStartId);
  }

  get inputRefDateEndId() {
    return `${this.windowId}_input_Reference_End`;
  }

  get inputRefDateEndElement() {
    return document.getElementById(this.inputRefDateEndId);
  }

  get docCountId() {
    return `${this.windowId}_doc_count`;
  }

  get docCountElement() {
    return document.getElementById(this.docCountId);
  }
}
