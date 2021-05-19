//Components
import { Window } from "../../../Components/GUI/js/Window";
import { CityObjectStyle } from "../../../Components/3DTiles/Model/CityObjectStyle";

import { CityObjectProvider } from "../ViewModel/CityObjectProvider";
import { CityObjectFilterSelector } from "./CityObjectFilterSelector";
import { CityObjectFilterWindow } from "./CityObjectFilterWindow";
import { AttributeFilterSelector } from "./AttributeFilterSelector";

import './CityObjectWindow.css';

/**
 * The main window of the city object module. It displays a short description
 * for the currently highlighted layer (filter and style), as well as the
 * selected city object.
 */
export class CityObjectWindow extends Window {
  /**
   * Constructs the window from the provider.
   * 
   * @param {CityObjectProvider} provider The city object provider.
   */
  constructor(provider) {
    super('cityObjects', 'City Objects', false);

    /**
     * The city object provider.
     * 
     * @type {CityObjectProvider}
     */
    this.provider = provider;

    /**
     * The window for selected filters.
     * 
     * @type {CityObjectFilterWindow}
     */
    this.filterWindow = new CityObjectFilterWindow();

    /**
     * The style for the layer chosen by the user, through the filter window.
     * 
     * @type {CityObjectStyle | string}
     */
    this.defaultLayerStyle = {materialProps: {color: 0xffa14f}};

    /**
     * Wether the use is currently selecting a city object.
     * 
     * @type {boolean}
     */
    this.isSelectingCityObject = false;

    /**
     * The list of extensions
     * 
     * @type {Array<{html: string, label: string, id: string}>}
     */
    this.extensions = [];

    let viewerDiv = document.getElementById('viewerDiv');
    /**
     * The event listener for mouse clicks.
     * 
     * @type {(event: MouseEvent) => any}
     */
    this.mouseClickListener = (event) => {
      this.provider.selectCityObject(event);
      this.provider.applyStyles();
    };
    this.addEventListener(Window.EVENT_ENABLED, () => {
      viewerDiv.addEventListener('mousedown', this.mouseClickListener);
    });
    this.addEventListener(Window.EVENT_DISABLED, () => {
      this.provider.removeLayer();
      this.provider.unselectCityObject();
      viewerDiv.removeEventListener('mousedown', this.mouseClickListener);
    });


    // Adding a filter selector for the attribute filter
    this.filterWindow.addFilterSelector(new AttributeFilterSelector(this.provider));

    // The event listener for filter selection (in the filter window). Updates
    // the layer in the provider.
    this.filterWindow.addEventListener(
      CityObjectFilterWindow.EVENT_FILTER_SELECTED,
      (filterLabel) => this._onFilterSelected(filterLabel));
    // The event listener for the layer change. Updates the layer description.
    this.provider.addEventListener(CityObjectProvider.EVENT_LAYER_CHANGED,
      () => this._updateLayerDescription());

    // Event listener for city object selection
    this.provider.addEventListener(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED,
      (cityObject) => this._updateSelectedCityObjectDescription(cityObject));

    this._updateLayerDescription();
    this._updateSelectedCityObjectDescription();
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">Filter<span class="color-indicator" id="${this.layerColorIndicatorId}"></span></h3>
        <div>
          <p class="city-object-title">
            <button id="${this.selectFilterButtonId}">Select</button>
            <button id="${this.clearFilterButtonId}">Clear</button>
          </p>
          <p class="city-object-value" id="${this.selectedFilterId}"></p>
        </div>
      </div>
      <div class="box-section">
        <h3 class="section-title">Selection<span class="color-indicator" id="${this.selectionColorIndicatorId}"></span></h3>
        <div id="${this.selectedCityObjectId}">

        </div>
        <div data-ext-container-default="div">

        </div>
        <hr>
        <div data-ext-container-default="button">
          <button id="${this.clearSelectionButtonId}">Clear selection</button>
        </div>
      </div>
    `;
  }

  windowCreated() {
    this.window.style.left = '10px';
    this.window.style.top = 'unset';
    this.window.style.bottom = '10px';
    this.window.style.width = '270px';

    this.filterWindow.appendTo(this.parentElement);
    this.filterWindow.disable();

    // Add extensions
    for (let extension of Object.values(this.extensions)) {
      this._createExtensionElement(extension);
    }

    this.selectFilterButtonElement.onclick =
      () => this.filterWindow.enable();

    this.clearFilterButtonElement.onclick =
      () => this.provider.removeLayer();

    this.clearSelectionButtonElement.onclick =
      () => this._clearCityObjectSelection();

    this.clearSelectionButtonElement.disabled = true;

    this._updateLayerDescription();
  }

  ///////////////////////
  ///// LAYER DESCRIPTION

  /**
   * Updates the layer description (filter and style).
   */
  _updateLayerDescription() {
    if (this.isCreated) {
      let layer = this.provider.getLayer();
      if (!!layer) {
        this.selectedFilterElement.innerText = layer.filter.toString();
        this.layerColorIndicatorElement.style.display = '';
        this.layerColorIndicatorElement.style.background =
          '#' + (new THREE.Color(layer.style.materialProps.color)).getHexString();
      } else {
        this.selectedFilterElement.innerText = '';
        this.layerColorIndicatorElement.style.display = 'none';
      }
    }
  }

  /////////////////////
  ///// FILTER SELECTOR

  /**
   * Adds a filter selector in the city object filter window.
   * 
   * @param {CityObjectFilterSelector} filterSelector The filter selector to
   * add.
   */
  addFilterSelector(filterSelector) {
    this.filterWindow.addFilterSelector(filterSelector);
  }

  /**
   * Triggered when the user selects a filter in the filter selection window.
   * Sets the correct layer in the provider.
   * 
   * @param {string} filterLabel The selected filter label.
   */
  _onFilterSelected(filterLabel) {
    if (!!filterLabel) {
      this.provider.setLayer(filterLabel, this.defaultLayerStyle);
    } else {
      this.provider.removeLayer();
    }
  }

  /**
   * Sets the default style for the layer defined by the user (through the
   * filter selection window).
   * 
   * @param {CityObjectStyle | string} style The default style for the layer.
   */
  setDefaultLayerStyle(style) {
    this.defaultLayerStyle = style;
  }

  ////////////////////////
  ///// BUILDING SELECTION

  /**
   * Clears the selected city object.
   */
  _clearCityObjectSelection() {
    this.provider.unselectCityObject();
    this.provider.applyStyles();
  }

  /**
   * Updates the description for the selected city object.
   * 
   * @param {CityObject} cityObject The selected city object.
   */
  _updateSelectedCityObjectDescription(cityObject) {
    if (!this.isCreated) {
      return;
    }

    this.selectionColorIndicatorElement.style.background = '#' +
      (new THREE.Color(this.provider.defaultSelectionStyle.materialProps.color)).getHexString();

    if (!cityObject) {
      this.selectedCityObjectElement.innerHTML = '';
      this.clearSelectionButtonElement.disabled = true;
      return;
    }

    this.clearSelectionButtonElement.disabled = false;

    let html = /*html*/`
      <p class="city-object-title">Attributes</p>
      <p class="city-object-value">
        Tile ID : ${cityObject.tile.tileId}<br>
        Batch ID : ${cityObject.batchId}<br>
        Layer : ${cityObject.tile.layer.name}
    `;
    for (let prop of Object.entries(cityObject.props)) {
      html += /*html*/`
        <br>${prop[0]} : ${prop[1]}
      `;
    }
    html += '</p>';
    this.selectedCityObjectElement.innerHTML = html;
  }

  /////////////
  ///// GETTERS

  get selectFilterButtonId() {
    return `${this.windowId}_filter_button`;
  }

  get selectFilterButtonElement() {
    return document.getElementById(this.selectFilterButtonId);
  }

  get selectedFilterId() {
    return `${this.windowId}_selected_filter`;
  }

  get selectedFilterElement() {
    return document.getElementById(this.selectedFilterId);
  }

  get clearFilterButtonId() {
    return `${this.windowId}_co_clear_filter_button`;
  }

  get clearFilterButtonElement() {
    return document.getElementById(this.clearFilterButtonId);
  }

  get selectedCityObjectId() {
    return `${this.windowId}_co_selected_paragraph`;
  }

  get selectedCityObjectElement() {
    return document.getElementById(this.selectedCityObjectId);
  }

  get clearSelectionButtonId() {
    return `${this.windowId}_co_clear_selection_button`;
  }

  get clearSelectionButtonElement() {
    return document.getElementById(this.clearSelectionButtonId);
  }

  get layerColorIndicatorId() {
    return `${this.windowId}_layer_color_indicator`;
  }

  get layerColorIndicatorElement() {
    return document.getElementById(this.layerColorIndicatorId);
  }

  get selectionColorIndicatorId() {
    return `${this.windowId}_selection_color_indicator`;
  }

  get selectionColorIndicatorElement() {
    return document.getElementById(this.selectionColorIndicatorId);
  }
}