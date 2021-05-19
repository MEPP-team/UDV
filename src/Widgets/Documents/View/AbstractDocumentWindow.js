//Components
import { Window } from "../../../Components/GUI/js/Window";

import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { DocumentView } from "./DocumentView";

import './DocumentWindow.css'

export class AbstractDocumentWindow extends Window {
  /**
   * Constructs an abstract document window from a name.
   * 
   * @param {string} name The name of the window.
   */
  constructor(name) {
    super(`document2-${name.replace(/ +/, "-").toLowerCase()}`,
      `Document - ${name}`, true);

    /**
     * The document provider.
     * 
     * @type {DocumentProvider}
     */
    this.provider = undefined;

    /**
     * The document view.
     * 
     * @type {DocumentView}
     */
    this.view = undefined;
  }
  
  /**
   * Function called when the document provider  and the view have been set up.
   * Operations that depends on them can be performed in this function.
   * 
   * @override
   */
  documentWindowReady() {

  }

  /**
   * Sets the provider and the view. Should be called by `DocumentView`. Once
   * this is done, the window is actually usable ; this triggers the
   * `documentWindowReady` method.
   * 
   * @param {DocumentView} view The document view.
   * @param {DocumentProvider} provider The document provider.
   */
  setupDocumentWindow(view, provider) {
    this.view = view;
    this.provider = provider;

    this.documentWindowReady();
  }

  /**
   * Request to show a this document window.
   * 
   * @param {boolean} [hideOtherWindows] Set to `true` to hide other document
   * windows.
   */
  requestDisplay(hideOtherWindows = false) {
    this.view.requestWindowDisplay(this, hideOtherWindows);
  }
}