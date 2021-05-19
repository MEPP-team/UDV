import { $3DTemporalTransaction } from './3DTemporalTransaction.js';

/**
 * Implements the aggregated transaction of the 3DTILES_temporal
 * extension. See the spec in 
 * ./jsonSchemas/3DTILES_temporal.transactionAggregate.schema.json
 */
export class $3DTemporalTransactionAggregate extends $3DTemporalTransaction {
    constructor(json) {
        super(json);

        this.transactions = {};
        // type testing is not reliable in javascript therefore we have to use
        // booleans to do so...
        this.isAggregate = true;
    }
}
