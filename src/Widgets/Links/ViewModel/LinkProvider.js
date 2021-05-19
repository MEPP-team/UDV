//Components
import { CityObject } from "../../../Components/3DTiles/Model/CityObject";
import { EventSender } from "../../../Components/Events/EventSender";
import { CityObjectStyle } from "../../../Components/3DTiles/Model/CityObjectStyle";

import { LinkService } from "../Model/LinkService";
import { DocumentProvider } from "../../Documents/ViewModel/DocumentProvider";
import { CityObjectProvider } from "../../CityObjects/ViewModel/CityObjectProvider";
import { Link } from "../Model/Link";
import { Document } from "../../Documents/Model/Document";
import { LinkCountFilter, LinkedWithDisplayedDocumentFilter, LinkedWithFilteredDocumentsFilter } from "./CityObjectLinkFilters";
import { DocumentFilter } from "../../Documents/ViewModel/DocumentFilter";


/**
 * The link provider is responsible to manage links fetched from the server,
 * and the interaction with the documents and city objects modules. It keeps
 * track of the filtered, displayed document as well as the selected city
 * object.
 */
export class LinkProvider extends EventSender {
  /**
   * Constructs the link provider.
   * 
   * @param {DocumentProvider} documentProvider The document provider.
   * @param {CityObjectProvider} cityObjectProvider The city object provider.
   * @param {LinkService} linkService The link service.
   * @param {object} config The configuration object for the application.
   * @param {object} config.cityObjects The object containing the configuration
   * for city objects
   * @param {object} config.cityObjects.styles A dictionary of styles for city
   * objects.
   * @param {CityObjectStyle} config.cityObjects.styles.linkedWithDisplayedDocument
   * The style for the city objects linked with displayed documents.
   */
  constructor(documentProvider, cityObjectProvider, linkService, config) {
    super();

    /**
     * The link service.
     * 
     * @type {LinkService}
     */
    this.linkService = linkService;

    /**
     * The document provider.
     * 
     * @type {DocumentProvider}
     */
    this.documentProvider = documentProvider;

    /**
     * The city object provider.
     * 
     * @type {CityObjectProvider}
     */
    this.cityObjectProvider = cityObjectProvider;

    /**
     * A filter for city objects based on their count of linked documents.
     * 
     * @type {LinkCountFilter}
     */
    this.linkCountFilter = new LinkCountFilter(this);
    this.cityObjectProvider.addFilter(this.linkCountFilter);

    /**
     * A filter for city objects based on wether they are linked with the
     * currently displayed document.
     * 
     * @type {LinkedWithDisplayedDocumentFilter}
     */
    this.linkedWithDisplayedDocFilter = new LinkedWithDisplayedDocumentFilter(this);
    this.cityObjectProvider.addFilter(this.linkedWithDisplayedDocFilter);

    /**
     * The style for city objects linked with the displayed document.
     * 
     * @type {CityObjectStyle}
     */
    this.linkDisplayedDocumentStyle = config.cityObjects.styles.linkedWithDisplayedDocument;

    /**
     * A filter for city objects based on wether they are linked with any of the
     * currently filtered documents (ie. the list of documents that appear in
     * the navigator).
     * 
     * @type {LinkedWithFilteredDocumentsFilter}
     */
    this.linkedWithFilteredDocsFilter = new LinkedWithFilteredDocumentsFilter(this);
    this.cityObjectProvider.addFilter(this.linkedWithFilteredDocsFilter);

    // The following adds a filter for documents, based on wether they are
    // linked with the currently selected city object.
    /**
     * Controls the "linked with selected city object" filter for documents.
     * This value determines wether the filter is active.
     */
    this.shouldFilterLinkedDocuments = false;
    this.documentProvider.addFilter(new DocumentFilter((doc) => {
      return !this.shouldFilterLinkedDocuments ||
        this.selectedCityObjectLinks.find(link => link.source_id === doc.id);
    }));

    this.documentProvider.refreshDocumentList();

    /**
     * The cached list of links.
     * 
     * @type {Array<Link>}
     */
    this.links = [];

    /**
     * The currently displayed document.
     * 
     * @type {Document}
     */
    this.displayedDocument = undefined;

    /**
     * The links of the currently displayed document.
     * 
     * @type {Array<Link>}
     */
    this.displayedDocumentLinks = [];

    /**
     * The list of filtered documents.
     * 
     * @type {Array<Document>}
     */
    this.filteredDocuments = [];

    /**
     * The links of the filtered documents.
     * 
     * @type {Array<Link>}
     */
    this.filteredDocumentsLinks = [];

    /**
     * The currently selected city object.
     * 
     * @type {CityObject}
     */
    this.selectedCityObject = undefined;

    /**
     * The links of the currently selected city object.
     * 
     * @type {Array<Link>}
     */
    this.selectedCityObjectLinks = [];

    // The link provider transmits the events from both the document and the
    // city object providers.
    this.registerEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED);
    this.registerEvent(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED);
    this.registerEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED);

    this.documentProvider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this._onDisplayedDocumentChange(doc));

    this.documentProvider.addEventListener(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED,
      (docs) => this._onFilteredDocumentsUpdate(docs));

    this.cityObjectProvider.addEventListener(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED,
      (co) => this._onCityObjectSelection(co));
  }

  /**
   * Triggers when the displayed document changed. Updates the displayed
   * document reference in the link provider and re-applies the styles for the
   * city objects. The event is propagated.
   * 
   * @param {Document} doc The newly displayed document.
   */
  _onDisplayedDocumentChange(doc) {
    this.displayedDocument = doc;
    this.displayedDocumentLinks = doc ? this.getLinksFromDocuments([doc]) : [];
    this.cityObjectProvider.applyStyles();
    this.sendEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED, doc);
  }

  /**
   * Triggers when the filtered documents change. Updates the filtered document
   * and their links in the provider, and re-applies the styles for the city
   * objects. The event is propagated.
   * 
   * @param {Array<Document>} docs The newly filtered documents.
   */
  _onFilteredDocumentsUpdate(docs) {
    this.filteredDocuments = docs;
    this.filteredDocumentsLinks = this.getLinksFromDocuments(docs);
    this.cityObjectProvider.applyStyles();
    this.sendEvent(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED, docs);
  }

  /**
   * Triggers when a city object is selected. Updates the city object and its
   * links in the provider, and refreshes the list of documents. The event is
   * propagated.
   * 
   * @param {CityObject} co The newly selected city object.
   */
  _onCityObjectSelection(co) {
    this.selectedCityObject = co;
    this.selectedCityObjectLinks = co ? this.getLinksFromCityObject(co) : [];
    if (this.shouldFilterLinkedDocuments) {
      this.documentProvider.refreshDocumentList();
    }
    this.sendEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED, co);
  }

  /**
   * Fetches the links from the server.
   * 
   * @async
   */
  async fetchLinks() {
    this.links = await this.linkService.getLinks('city_object');
    this._onDisplayedDocumentChange(this.displayedDocument);
    this._onFilteredDocumentsUpdate(this.filteredDocuments);
    this._onCityObjectSelection(this.selectedCityObject);
  }

  /**
   * Deletes the link.
   * 
   * @async
   * @param {Link} link The link to delete.
   */
  async deleteLink(link) {
    await this.linkService.deleteLink('city_object', link.id);
    await this.fetchLinks();
  }

  /**
   * Creates a new link.
   * 
   * @param {Link} link The link to create.
   */
  async createLink(link) {
    let formData = new FormData();
    formData.append('source_id', link.source_id);
    formData.append('target_id', link.target_id);
    formData.append('centroid_x', link.centroid_x);
    formData.append('centroid_y', link.centroid_y);
    formData.append('centroid_z', link.centroid_z);
    await this.linkService.createLink('city_object', formData);
    await this.fetchLinks();
  }

  /**
   * Returns the cached list of links.
   * 
   * @returns {Array<Link>} The cached list of links.
   */
  getLinks() {
    return this.links;
  }

  /**
   * Returns the links from a list of documents.
   * 
   * @param {Array<Document>} docs A list of documents.
   */
  getLinksFromDocuments(docs) {
    return this.links.filter((link) =>
      docs.find((doc) => doc.id == link.source_id) !== undefined);
  }

  /**
   * Returns the links from a city object.
   * 
   * @param {CityObject} cityObject The city object.
   */
  getLinksFromCityObject(cityObject) {
    return this.links.filter((link) =>
      link.target_id == cityObject.props['cityobject.database_id']);
  }

  /**
   * Returns the links from the displayed document.
   * 
   * @returns {Array<Link>} The list of links.
   */
  getDisplayedDocumentLinks() {
    return this.displayedDocumentLinks;
  }

  /**
   * Returns the links from the filtered documents.
   * 
   * @returns {Array<Link>} The list of links.
   */
  getFilteredDocumentsLinks() {
    return this.filteredDocumentsLinks;
  }

  /**
   * Returns the links from the selected city object.
   * 
   * @returns {Array<Link>} The list of links.
   */
  getSelectedCityObjectLinks() {
    return this.selectedCityObjectLinks;
  }

  /**
   * Returns the list of documents linked to the selected city object.
   * 
   * @returns {Array<Document>} The list of linked documents.
   */
  getSelectedCityObjectLinkedDocuments() {
    let allDocuments = this.documentProvider.getAllDocuments().slice();
    let docIdsToFind = this.selectedCityObjectLinks.map(link => link.source_id);
    return allDocuments.filter(doc => docIdsToFind.includes(doc.id));
  }

  /**
   * Toggles the filter for the documents, based on wether they are linked with
   * the selected city object.
   * 
   * @param {Boolean} [toggle] The desired value (`true` activates the filter).
   * If not specified, the activation state of the filter is simply negated (ie.
   * if the filter was active, it is now inactive and vice-versa)
   */
  toggleLinkedDocumentsFilter(toggle) {
    if (toggle === null || toggle === undefined) {
      toggle = !this.shouldFilterLinkedDocuments;
    }
    this.shouldFilterLinkedDocuments = toggle;
    this.documentProvider.refreshDocumentList();
  }

  /**
   * Filters the city objects that are linked with the displayed document.
   */
  highlightDisplayedDocumentLinks() {
    this.cityObjectProvider.setLayer('linkDisplayedDoc', this.linkDisplayedDocumentStyle);
  }

  /**
   * Filters the city objects that are linked with the filtered document.
   */
  highlightFilteredDocumentsLinks() {
    this.cityObjectProvider.setLayer('linkFilteredDocs', {materialProps: {color: 'blue'}});
  }
}