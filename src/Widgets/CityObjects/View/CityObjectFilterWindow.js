//Components
import { Window } from "../../../Components/GUI/js/Window";

import { CityObjectFilterSelector } from "./CityObjectFilterSelector";

/**
 * The filter selection window. This window allows the user to pick a filter
 * through the list of `FilterSelector`s. A filter selector is associated with
 * a filter and can offer some parameters through a form.
 */
export class CityObjectFilterWindow extends Window {
  /**
   * Creates a city object filter window.
   */
  constructor() {
    super('cityObjectsFilters', 'City Objects - Filters', true);

    /**
     * The list of filter selectors.
     * 
     * @type {Array<CityObjectFilterSelector>}
     */
    this.filterSelectors = [];

    // Event registration
    this.registerEvent(CityObjectFilterWindow.EVENT_FILTER_SELECTED);
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">Filter selection</h3>
        <form id="${this.filterFormId}">
          <select name="filterLabel" id="${this.filterSelectId}">
          </select>
          <div id="${this.filterSectionId}" class="city-object-filter-section">
          </div>
          <input type="submit" value="Set filter">
        </form>
      </div>
    `;
  }

  windowCreated() {
    this.window.style.left = '290px';
    this.window.style.top = 'unset';
    this.window.style.bottom = '10px';
    this.window.style.width = '270px';
    this.window.style.minHeight = 'unset';

    this._createFilterSelect();

    this.filterSelectElement.oninput = () => this._onFilterSelection();

    this.filterFormElement.onsubmit = () => {
      this._onSubmit();
      return false;
    }
  }

  /**
   * Adds a filter selector in the filter selectos list.
   * 
   * @param {CityObjectFilterSelector} filterSelector The filter selector to
   * add.
   */
  addFilterSelector(filterSelector) {
    if (!!this.getFilterSelector(filterSelector.filterLabel)) {
      throw 'A filter selector with the same filter label already exist: '
        + filterSelector.filterLabel;
    }
    this.filterSelectors.push(filterSelector);
    this._createFilterSelect();
  }

  /**
   * Returns the filter selector corresponding to the given filter label.
   * 
   * @param {string} filterLabel The label of the filter.
   */
  getFilterSelector(filterLabel) {
    return this.filterSelectors.find((fs) => fs.filterLabel === filterLabel);
  }

  /**
   * Fills the HTML select element with an option for each filter selector.
   * Also adds a 'No filter' option.
   */
  _createFilterSelect() {
    if (!this.isCreated) {
      return;
    }

    let select = this.filterSelectElement;

    select.innerHTML = '';

    let defaultOption = document.createElement('option');
    defaultOption.label = 'no-filter';
    defaultOption.innerText = 'No filter';
    select.appendChild(defaultOption);

    for (let filterSelector of this.filterSelectors) {
      let option = document.createElement('option');
      option.label = filterSelector.filterLabel;
      option.innerText = filterSelector.displayName;
      select.appendChild(option);
    }
  }

  /**
   * Triggered when the users selects a filter in the dropdown list. It
   * displays the corresponding form fields (if any) after the select input.
   */
  _onFilterSelection() {
    this.filterSectionElement.innerHTML = '';
    let selector = this._getCurrentSelector();
    if (!!selector) {
      selector.appendFormFieldsTo(this.filterSectionElement);
    }
  }

  /**
   * Returns the current filter selector, or `undefined` if the user has
   * selected the 'No filter' option.
   */
  _getCurrentSelector() {
    let selected = this.filterSelectElement.options[this.filterSelectElement.selectedIndex].label;

    if (selected === 'no-filter') {
      return undefined;
    }
    
    let selector = this.getFilterSelector(selected);

    if (selector === undefined) {
      throw 'Cannot find selector with label ' + selected;
    }

    return selector;
  }

  /**
   * Triggers when the form is submitted. The `EVENT_FILTER_SELECTED` event is
   * sent and the window closes.
   */
  _onSubmit() {
    let selector = this._getCurrentSelector();
    if (selector === undefined) {
      this.sendEvent(CityObjectFilterWindow.EVENT_FILTER_SELECTED, undefined);
      this.disable();
      return;
    }

    let formData = new FormData(this.filterFormElement);
    selector.onSubmit(formData);
    this.sendEvent(CityObjectFilterWindow.EVENT_FILTER_SELECTED, selector.filterLabel);
    this.disable();
  }

  /////////////
  ///// GETTERS

  get filterSelectId() {
    return `${this.windowId}_filters_select`;
  }

  get filterSelectElement() {
    return document.getElementById(this.filterSelectId);
  }

  get filterFormId() {
    return `${this.windowId}_filter_form`;
  }

  get filterFormElement() {
    return document.getElementById(this.filterFormId);
  }

  get filterSectionId() {
    return `${this.windowId}_filter_section`;
  }

  get filterSectionElement() {
    return document.getElementById(this.filterSectionId);
  }

  ////////////
  ///// EVENTS

  static get EVENT_FILTER_SELECTED() {
    return 'EVENT_FILTER_SELECTED';
  }
}