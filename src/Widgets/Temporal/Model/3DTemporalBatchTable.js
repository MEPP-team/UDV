/**
 * Implements the batch table of the 3DTILES_temporal
 * extension. See the spec in 
 * ./jsonSchemas/3DTILES_temporal.batchTable.schema.json
 */
export class $3DTemporalBatchTable {
    /**
     * Verifies the integrity and stores the data corresponding to the
     * batch table part of the 3DTiles_temporal extension.
     * @param {Object} json The json containing the 3DTiles_temporal 
     * extension batch table part for a given tile.
     */
    constructor(json) {
        // Poor verification that the handled json corresponds to the temporal
        // extension spec. Should be done by comparing it with the JSON schema.
        if (!json.startDates || !Array.isArray(json.startDates)) {
            console.error("3D Tiles batch table temporal extension requires " +
            "a startDates array. Refer to the spec.");
        }
        if (!json.endDates || !Array.isArray(json.endDates)) {
            console.error("3D Tiles batch table temporal extension requires " + 
            "an endDates array. Refer to the spec.");
        } 
        if (!json.featureIds || !Array.isArray(json.featureIds)) {
            console.error("3D Tiles batch table temporal extension requires " + 
            "a featureIds array. Refer to the spec.");
        }
        if (json.startDates.length !== json.endDates.length ||
            json.startDates.length !== json.featureIds.length) {
            console.error("3D Tiles temporal extensions arrays startDates " + 
            "(length: " + json.startDates.length + "), endDates (length: " + 
            json.endDates.length + ") and json.featureIds (length: " + 
            json.featureIds.length + ") must be the same length.");
        } 
    
        this.startDates = json.startDates;
        this.endDates = json.endDates;
        this.featureIds = json.featureIds;
    }

    /**
     * Checks that the batch table temporal extension has values for a given 
     * identifier.
     * @param {Number} batchId The identifier to check (identifier in the batch,
     * i.e. position in the arrays). 
     */
    hasInfoForId(batchId) {
        // The constructor ensures that the three arrays have the same size.
        return !!this.startDates[batchId];
    }

    /**
     * Returns information for the given batchId. 
     * Can be used to display information associated with an object
     * picked with the mouse for instance.
     * @param {*} batchId The given identifier (identifier in the batch,
     * i.e. position in the arrays).
     */
    getInfoById(batchId) {
        if (!this.hasInfoForId(batchId)) {
            console.error("3D Tiles batch table temporal extension does not " +
            "have information for batch ID " + batchId);
        }
        return {
            'featureId': this.featureIds[batchId],
            'startDate': this.startDates[batchId],
            'endDate': this.endDates[batchId]
        };
    }
}