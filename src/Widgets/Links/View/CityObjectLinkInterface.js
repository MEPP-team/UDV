import { LinkService } from "../Model/LinkService";
import { CityObjectModule } from "../../CityObjects/CityObjectModule";
import { CityObjectFilterSelector } from "../../CityObjects/View/CityObjectFilterSelector";
import { LinkProvider } from "../ViewModel/LinkProvider";
import { CityObjectProvider } from "../../CityObjects/ViewModel/CityObjectProvider";
import { LinkView } from "./LinkView";

/**
 * The interface extensions for the city object window.
 */
export class CityObjectLinkInterface {
  /**
   * Constructs the city object link interface.
   * 
   * @param {LinkView} linkView The link view.
   * @param {CityObjectModule} cityObjectModule The city object module.
   * @param {LinkProvider} linkProvider The link service.
   */
  constructor(linkView, cityObjectModule, linkProvider) {
    /**
     * The link count filter selector.
     */
    this.linkCountFilterSelector = new LinkCountFilterSelector(linkProvider);
    cityObjectModule.addFilterSelector(this.linkCountFilterSelector);

    // Adds an extension in the 'selected city object' panel of the city object
    // window. Displays the links of the selected city objects and a button
    // to show them in the document navigator.
    cityObjectModule.addExtension('links', {
      type: 'div',
      html: /*html*/`
        <div id="${this.linkListId}">
        </div>
        <button id="${this.showDocsButtonId}">Show in navigator</button>
      `,
      oncreated: () => {
        this._updateLinkList();
        this.showDocsButtonElement.onclick = () => {
          linkView.requestDisplayDocuments();
          linkProvider.toggleLinkedDocumentsFilter(true);
        };
      }
    });

    /**
     * The link provider.
     * 
     * @type {LinkProvider}
     */
    this.linkProvider = linkProvider;

    this.linkProvider.addEventListener(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED,
      () => this._updateLinkList());
  }

  /**
   * Updates the list of links for the currently selected city object.
   */
  _updateLinkList() {
    if (!this.linkListElement) {
      return;
    }
    let docs = this.linkProvider.getSelectedCityObjectLinkedDocuments();
    let listHtml = `<p class="city-object-title">${docs.length} linked document(s)</p>`
    if (docs.length > 0) {
      listHtml += `<p class="city-object-value"><ul>`;
      for (let doc of docs) {
        listHtml += `<li>${doc.title}</li>`;
      }
      listHtml += '</ul></p>';
    }
    this.linkListElement.innerHTML = listHtml;
  }

  //////////////
  ////// GETTERS

  get linkListId() {
    return `city_objects_link_list`;
  }

  get linkListElement() {
    return document.getElementById(this.linkListId);
  }

  get showDocsButtonId() {
    return `city_objects_link_show_doc`;
  }

  get showDocsButtonElement() {
    return document.getElementById(this.showDocsButtonId);
  }
}

/**
 * The filter selector for the link count filter. The user has the option to
 * choose the minimum required link count.
 */
export class LinkCountFilterSelector extends CityObjectFilterSelector {
  /**
   * Creates the filter selector.
   * 
   * @param {LinkProvider} linkProvider The link provider.
   */
  constructor(linkProvider) {
    super('linkCount', 'Number of linked documents');

    /**
     * The reference to the filter.
     */
    this.filter = linkProvider.linkCountFilter;
  }

  get html() {
    return /*html*/`
      <label for="requiredCount">Required count of linked documents</label>
      <input type="text" name="requiredCount" value="1">
    `;
  }

  onSubmit(formData) {
    this.filter.requiredCount = Number(formData.get('requiredCount')) || 1;
  }
}