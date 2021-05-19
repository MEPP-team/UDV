/**
 * Represents a window extension.
 */
export class WindowExtension {
  /**
   * Create a new Window extension object.
   * 
   * @param {string} label The unique label for the extension.
   * @param {object} options The options for the extension.
   * @param {string} options.id The ID of the root HTML element.
   * @param {string} options.type The type of the extension. Can either be
   * `button` or `div`.
   * @param {string} options.html The inner HTML content for the extension. If
   * this is a `button`, it represents the displayed text. If this is a `div`,
   * it represents the inner HTML content.
   * @param {string} [options.container] The label of the parent container.
   * @param {function} [options.oncreated] A callback triggered when the
   * HTML elements of the extension is effectively created.
   * @param {function} [options.callback] The callback to call when the user
   * clicks on a `button` extension. This has no effects on `div` extensions.
   */
  constructor(label, options) {
    /**
     * The unique label for the extension.
     * 
     * @type {string}
     */
    this.label = label;

    if (!options) {
      throw 'Missing options parameter';
    }

    if (!options.id) {
      throw 'Missing ID option';
    }
    /**
     * The ID of the root HTML element.
     * 
     * @type {string}
     */
    this.id = options.id;

    if (!options.html) {
      throw 'Missing html option';
    }
    /**
     * The inner HTML content for the extension. If
     * this is a `button`, it represents the displayed text. If this is a `div`,
     * it represents the inner HTML content.
     * 
     * @type {string}
     */
    this.html = options.html;

    if (!options.type) {
      throw 'Missing type option';
    }
    options.type = options.type.toLowerCase();
    if (options.type !== 'div' && options.type !== 'button') {
      throw 'Wrong type option "' + options.type + 
        '": only "div" and "button" are supported';
    }
    /**
     * The type of the extension. Can either be
     * `button` or `div`.
     * 
     * @type {string}
     */
    this.type = options.type;

    /**
     * The label of the parent container.
     * 
     * @type {string}
     */
    this.container = options.container;

    if (options.type === 'button' && !options.callback) {
      throw 'A button extension should have a callback';
    }
    /**
     * The callback to call when the user
     * clicks on a `button` extension. This has no effects on `div` extensions.
     * 
     * @type {function}
     */
    this.callback = options.callback;

    /**
     * A callback triggered when the
     * HTML elements of the extension is effectively created.
     * 
     * @type {function}
     */
    this.oncreated = options.oncreated;
  }

  /**
   * Searches for a HTML node that can contains the extension.
   * 
   * @param {HTMLElement} htmlRoot The HTML root to search the container.
   * 
   * @returns {HTMLElement}
   */
  findContainer(htmlRoot) {
    let queries = [];
    if (!!this.container) {
      queries.push(`[data-ext-container="${this.type}-${this.container}"]`);
      queries.push(`[data-ext-container="${this.container}"]`);
    }
    queries.push(`[data-ext-container="${this.type}"]`)
    queries.push(`[data-ext-container-default="${this.type}"]`)
    
    let container;
    for (let query of queries) {
      container = htmlRoot.querySelector(query);
      if (!!container) {
        break;
      }
    }

    if (!container) {
      throw 'No container found for the extension : ' + this.label;
    }

    return container;
  }

  /**
   * Adds the extension in the given HTML node.
   * 
   * @param {HTMLElement} htmlElement The parent element (should be the root
   * of the window).
   */
  appendTo(htmlElement) {
    let container = this.findContainer(htmlElement);

    let rootType = '';
    if (this.type === 'div') {
      rootType = 'div';
    } else if (this.type === 'button') {
      rootType = 'button';
    }
    let root = document.createElement(rootType);
    root.id = this.id;
    root.innerHTML = this.html;

    let containerClass = container.dataset.extClass;
    if (containerClass) {
      root.classList.add(containerClass);
    }

    if (this.type === 'button') {
      root.onclick = this.callback;
    }
    container.appendChild(root);
    if (typeof(this.oncreated) === 'function') {
      this.oncreated();
    }
  }
}