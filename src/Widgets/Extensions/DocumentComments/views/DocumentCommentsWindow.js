import { AbstractDocumentWindow } from '../../../Documents/View/AbstractDocumentWindow';

import { DocumentCommentsService } from '../services/DocumentCommentsService';
import './DocumentCommentsStyle.css';

/**
 * A window to display the comments associated to a document. Also serves as
 * a comments creation interface.
 */
export class DocumentCommentsWindow extends AbstractDocumentWindow {

    /**
     * Creates a document comments window to add in the document browser.
     * 
     * @param {DocumentCommentsService} documentCommentsService The document comments
     * service.
     */
    constructor(documentCommentsService) {
        super('Comments');
        this.documentCommentsService = documentCommentsService;
    }

    get innerContentHtml() {
        return /*html*/`
        <div class="innerClass" id="documentComments_innerWindow">
            <div id ="documentComments_left">

            </div>
            <div id ="documentComments_right">
                <form id="documentComments_inputForm">
                    <div class="commentRow">
                        <textarea placeholder="Enter your comment here." id="documentComments_inputComment" name="description" ></textarea>
                    </div>
                    <div class="commentRow">
                        <button type="button" id ="documentComments_inputButton">Comment</button>
                    </div>
                </form>
            </div>
        </div>
        `;
    }

    windowCreated() {
        this.hide();

        this.window.style.width = '500px';
        this.window.style.height = '500px';
        this.window.style.left = '290px';
        this.window.style.top = '10px';
        this.innerContent.style.height = '100%';
        document.getElementById('documentComments_inputButton').onclick = this.publishComment.bind(this);
        this.getComments();
    }

    documentWindowReady() {
        this.view.inspectorWindow.addExtension('Comments', {
            type: 'button',
            container: 'left',
            html: 'Comments',
            callback: () => {
                this.view.requestWindowDisplay(this);
                this.getComments();
            }
        });
    }

    getComments() {
        this.documentCommentsService.getComments().then((comments) => {
            document.getElementById('documentComments_left').innerHTML = '';
            for (let comment of comments) {
                let text = (typeof comment.description === 'string') ? comment.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
                let div = document.createElement('div');
                div.className = 'talk-bubble';
                div.innerHTML = `
                    <div class="talktext">
                    <p class="talktext-author">${comment.author.firstName} ${comment.author.lastName}</p>
                    <p class="talktext-comment">${text}</p>
                    <p class="talktext-date">${(new Date(comment.date)).toLocaleString()}</p>
                    </div>
                `;
                document.getElementById('documentComments_left').appendChild(div);
            }
        }, (reason) => {
            alert(reason);
            this.disable();
        });
    }


    async publishComment() {
        let form = document.getElementById('documentComments_inputForm');
        let form_data = new FormData(form);
        try {
            await this.documentCommentsService.publishComment(form_data).then(() => {
                document.getElementById('documentComments_inputComment').value = '';
                this.getComments();
            });
        } catch (e) {
            alert(e);
        }
    }
}
