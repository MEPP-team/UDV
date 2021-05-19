/**
 * Implements the version concept of the 3DTILES_temporal
 * extension. See the spec in 
 * ./jsonSchemas/3DTILES_temporal.version.schema.json
 */
export class $3DTemporalVersion {
    constructor(json) {
        this.versions = json;
        for (let i = 0; i < json.length; i++) {
            // Add the fields missing for the graph window
            this.versions[i].label = json[i].name;
            this.versions[i].level = i;
            this.versions[i].group = "consensusScenario"; // Needs to be changed if one wants multiple scenario
            this.versions[i].title = json[i].description;
        }
     }
}