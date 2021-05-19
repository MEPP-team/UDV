import { $3DTemporalTransaction } from './3DTemporalTransaction.js';

/**
 * Implements the primary transaction of the 3DTILES_temporal
 * extension. See the spec in 
 * ./jsonSchemas/3DTILES_temporal.primaryTransaction.schema.json
 */
export class $3DTemporalPrimaryTransaction extends $3DTemporalTransaction {
    constructor(json) {
        super(json);

        this.type = json.type;
        // type testing is not reliable in javascript therefore we have to use
        // booleans to do so...
        this.isPrimary = true;
    }
}
