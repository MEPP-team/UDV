//Components
import { RequestService } from "../../../../Components/Request/RequestService";

import { DocumentProvider } from "../../../Documents/ViewModel/DocumentProvider";

/**
 * The service that performs the requests for document comments. This include
 * retrieve and create operations.
 */
export class DocumentCommentsService {
    /**
     * Creates a document comments service.
     * 
     * @param {DocumentProvider} documentProvider The document provider.
     * @param {RequestService} requestService The request service.
     * @param {object} config The UD-Viz config.
     * @param {object} config.server The server access config.
     * @param {string} config.server.url The server URL.
     * @param {string} config.server.document The route for documents.
     * @param {string} config.server.comment The route for comments.
     * @param {string} config.server.user The route for users.
     */
    constructor (documentProvider, requestService, config) {
        this.documentProvider = documentProvider;

        this.requestService = requestService;
        
        this.documentUrl = `${config.server.url}${config.server.document}`;
        this.commentRoute = config.server.comment;
        this.authorUrl = `${config.server.url}${config.server.user}`;
    }

    async getComments() {
        let currentDocument = this.documentProvider.getDisplayedDocument();
        if (currentDocument !== null && currentDocument !== undefined) {
            let url = this.documentUrl + "/" + currentDocument.id + "/" + this.commentRoute;
            let response = (await this.requestService.request('GET', url, {authenticate: 'auto'})).response;
            let jsonResponse = JSON.parse(response);
            for (let element of jsonResponse) {
                let url = this.authorUrl + "/" + element.user_id;
                let responseAuthor = (await this.requestService.request('GET', url, {authenticate: 'auto'})).response;
                element.author = JSON.parse(responseAuthor);
            }
            return jsonResponse;
        }
        return [];
    }

    async publishComment(formData) {
        let currentDocument = this.documentProvider.getDisplayedDocument();
        if (currentDocument !== null && currentDocument !== undefined) {
            let url = this.documentUrl + "/" + currentDocument.id + "/" + this.commentRoute;
            let response = (await this.requestService.send('POST', url, formData)).response;
        }
    }
}