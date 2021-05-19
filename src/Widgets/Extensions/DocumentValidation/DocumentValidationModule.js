//Widgets
import { DocumentModule } from "../../Documents/DocumentModule";

import { ValidationService } from "./Service/ValidationService";
import { DocumentsInValidationDocumentSource } from "./Service/DocumentsInValidationSource";
import { ValidationView } from "./View/ValidationView";

/**
 * The document extension to manage documents validation. It allows the user to
 * see documents in validation by clicking on the "Show document in validation"
 * button in the search window. If the user is a moderator, he/she can also
 * click on the "Validate" button in the document browser to validate it.
 */
export class DocumentValidationModule {
  /**
   * Creates the document validation module. Creates a validation service to
   * manage HTTP requests, a validation source to change the retrieving URL
   * and finally the view elements.
   * 
   * @param {DocumentModule} documentModule The documents module. 
   */
  constructor(documentModule, requestService, config) {
    this.validationService = new ValidationService(requestService, config);

    this.validationSource = new DocumentsInValidationDocumentSource(config);

    new ValidationView(documentModule, this.validationService,
      this.validationSource);
  }
}