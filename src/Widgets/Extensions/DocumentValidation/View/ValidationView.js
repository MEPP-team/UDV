import { DocumentModule } from "../../../Documents/DocumentModule";
import { DocumentSource } from "../../../Documents/Model/DocumentService";
import { Document } from "../../../Documents/Model/Document";

//Components
import { Window } from "../../../../Components/GUI/js/Window";

import { ValidationService } from "../Service/ValidationService";
import { DocumentsInValidationDocumentSource } from "../Service/DocumentsInValidationSource";

/**
 * This class represents the visual elements and their logic for the
 * validation module :
 * 
 * - Button "See documents in validation" to change the document source
 * - Panel "Currently seing ..." to inform the user that he/she is consulting
 * documents in validation or validated documents
 * - Button "Validate" to validate a document
 */
export class ValidationView {
  /**
   * Creates the view.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {ValidationService} validationService The validation service.
   * @param {DocumentsInValidationDocumentSource} validationSource The source
   * for documents in validation
   */
  constructor(documentModule, validationService, validationSource) {
    this.documentModule = documentModule;
    this.validationService = validationService;

    /**
     * Defines wether the interface displays documents to validate (`true`) or
     * validated documents (`false`).
     * 
     * @type {boolean}
     */
    this.displayingDocumentsToValidate = false;

    /**
     * Stores the previous document source to restore it (the source for
     * validated documents).
     * 
     * @type {DocumentSource}
     */
    this.previousDocumentSource = undefined;

    /**
     * The validation source.
     * 
     * @type {DocumentsInValidationDocumentSource}
     */
    this.validationSource = validationSource;

    // Adds a panel to inform the user about the documents he/she is currently
    // viewing, and give him the possibility to switch.
    documentModule.addNavigatorExtension('Validation Filter', {
      type: 'div',
      container: 'filter',
      html: /*html*/`
        <label for="${this.switchId}">Validation status : </label>
        <select id="${this.switchId}">
          <option value="validated">Validated documents</option>
          <option value="in-validation">Documents in validation</option>
        </select>
      `
    });

    documentModule.view.navigatorWindow.addEventListener(Window.EVENT_CREATED,
      () => this._initView());
  }

  _initView() {
    this.switchElement.value = 'validated';
    this._toggleValidation();
    this.switchElement.onchange = () => {
      this._toggleValidation();
    }
  }

  ///////////////////////////////////////
  ///// METHODS FOR TRIGERRING VALIDATION

  /**
   * Toggles the visualization of documents in validation, then refreshes the
   * document list with the new source. If the refresh fails (probably because
   * the user isn't logged in), reverts back to displaying validated documents.
   * 
   * @private
   */
  _toggleValidation() {
    this.displayingDocumentsToValidate =
      this.switchElement.value === 'in-validation';
    if (this.displayingDocumentsToValidate) {
      this._showDocumentsInValidation();
    } else {
      this._showValidatedDocuments()
    }

    this.documentModule.refreshDocumentList().then(() => {
    }, (reason) => {
      this._showValidatedDocuments();
      this.displayingDocumentsToValidate = false;
      this.switchElement.value = "validated";
      alert(reason);
    });
  }

  /**
   * Sets the document source to be documents in validation, and adds a
   * 'Validate' button in the browser.
   * 
   * @private
   */
  _showDocumentsInValidation() {
    // Change the document source
    this.previousDocumentSource = this.documentModule
      .changeDocumentSource(this.validationSource, true);
    
    // Adds the validate button
    this.documentModule.addInspectorExtension('Validate', {
      type: 'button',
      container: 'right',
      html: 'Validate',
      callback: (doc) => this._validateDocument(doc)
    });
  }

  /**
   * Sets to document source to validated documents, and removes the 'Validate'
   * button in the browser.
   * 
   * @private
   */
  _showValidatedDocuments() {
    if (!this.previousDocumentSource) {
      return;
    }

    this.documentModule.changeDocumentSource(this.previousDocumentSource,
      false);

    try {
      this.documentModule.removeBrowserExtension('Validate');
    } catch (_) {
      // Validate does not exist
    }
  }

  /**
   * Validates the document.
   * 
   * @private
   * 
   * @param {Document} doc The document to validate.
   */
  _validateDocument(doc) {
    if (!confirm('Are you sure do validate this document ? ' +
      'This operation is irreversible.')) {
      return;
    }
    this.validationService.validate(this.documentModule.provider.getDisplayedDocument()).catch((reason) => {
      alert(reason.statusText);
    }).then(() => {
      this.documentModule.refreshDocumentList();
    });
  }

  /////////////
  ///// GETTERS

  get switchId() {
    return 'document-validation-view-switch';
  }
  
  get switchElement() {
    return document.getElementById(this.switchId);
  }
}