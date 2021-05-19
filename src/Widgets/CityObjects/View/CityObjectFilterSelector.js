/**
 * Represents an option in the list of filters the user can select. It also
 * stores additional HTML that can be put in a form if the filter accepts
 * parameters.
 */
export class CityObjectFilterSelector {
  /**
   * Constructs a filter selector from the associated filter label and a
   * display name.
   * 
   * @param {string} filterLabel The associated filter.
   * @param {string} displayName The displayed name in the `select` tag.
   */
  constructor(filterLabel, displayName) {    
    /**
     * The label of the corresponding filter.
     * 
     * @type {string}
     */
    this.filterLabel = filterLabel;

    /**
     * The displayed name of the filter.
     * 
     * @type {string}
     */
    this.displayName = displayName;
  }

  /**
   * The HTML that will be put in the filter form.
   * 
   * @returns {string}
   */
  get html() {
    return `
    `;
  }

  /**
   * Triggers when the HTML elements are created.
   */
  onCreated() {

  }

  /**
   * Triggers when the form is submitted.
   * 
   * @param {FormData} formData The form data corresponding to the filter
   * selector form.
   */
  onSubmit(formData) {

  }

  /**
   * Adds the HTML content of the filter selector in the given HTLM element.
   * This element should be a form, or part of a form. Calls the `onCreated`
   * hook.
   * 
   * @param {HTMLElement} parentElement The parent element to add the fields.
   */
  appendFormFieldsTo(parentElement) {
    parentElement.innerHTML = this.html;
    this.onCreated();
  }
}