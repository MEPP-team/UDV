//Widgets
import { DocumentModule } from "../../../Documents/DocumentModule";

import { ContributeService } from "../Service/ContributeService";

/**
 * Represents a really simple interface to delete a document. It is just a
 * button in the document browser that use `confirm` and `alert` to communicate
 * with the user.
 */
export class DocumentDeletionInterface {
  /**
   * Creates a button in the document browser to perform the deletion.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {ContributeService} contributeService The contribute service.
   */
  constructor(documentModule, contributeService) {
    documentModule.addInspectorExtension('Delete', {
      type: 'button',
      container: 'right',
      html: 'Delete',
      callback: async () => {
        if (!confirm('You are going to delete the document. This operation ' +
          'is irreversible. Do you want to continue ?')) {
          return;
        }
        try {
          await contributeService.deleteDocument();
        } catch (e) {
          alert(e);
        }
      }
    });
  }
}