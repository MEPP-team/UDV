/**
 * Represents a document.
 */
export class Document {
  /**
   * Creates a new document.
   */
  constructor() {
    /**
     * The ID of the document.
     * 
     * @type {number}
     */
    this.id;

    /**
     * The title of the document.
     * 
     * @type {string}
     */
    this.title;

    /**
     * The source of the document.
     * 
     * @type {string}
     */
    this.source;

    /**
     * The holder of the rights for the document.
     * 
     * @type {string}
     */
    this.rightsHolder;

    /**
     * The description of the document.
     * 
     * @type {string}
     */
    this.description;

    /**
     * The reference data, in an ISO 8601 format.
     * 
     * @type {string}
     */
    this.refDate;

    /**
     * The publication data, in an ISO 8601 format.
     * 
     * @type {string}
     */
    this.publicationDate;

    /**
     * The creator id.
     * 
     * @type {number}
     */
    this.user_id;

    /**
     * The validation status information.
     * 
     * @type {{status: string}}
     */
    this.validationStatus;

    /**
     * Visualization information.
     * 
     * @type {{
     *   positionX: number,
     *   positionY: number,
     *   positionZ: number,
     *   quaternionX: number,
     *   quaternionY: number,
     *   quaternionZ: number,
     *   quaternionW: number
     * }}
     */
    this.visualization;
  }
}