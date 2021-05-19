/**
 * Represents a link between a document and a target (in this example, the
 * only valid target types are city objects).
 */
export class Link {
  /**
   * Constructs an empty link.
   */
  constructor() {
    /**
     * The ID of the link.
     * 
     * @type {number}
     */
    this.id;

    /**
     * The source (document) ID.
     * 
     * @type {number}
     */
    this.source_id;

    /**
     * The target ID. For the moment, the only targets are city objects.
     * 
     * @type {number}
     */
    this.target_id;

    /**
     * The X coordinate of the centroid. The centroid must be stored in the
     * in order to travel to the city object.
     * 
     * @type {number}
     */
    this.centroid_x;

    /**
     * The Y coordinate of the centroid. The centroid must be stored in the
     * in order to travel to the city object.
     * 
     * @type {number}
     */
    this.centroid_y;

    /**
     * The Z coordinate of the centroid. The centroid must be stored in the
     * in order to travel to the city object.
     * 
     * @type {number}
     */
    this.centroid_z;
  }
}