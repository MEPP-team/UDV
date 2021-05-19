import { $3DTemporalPrimaryTransaction } from '../Model/3DTemporalPrimaryTransaction.js';
import { $3DTemporalTransactionAggregate } from '../Model/3DTemporalTransactionAggregate.js';
import { $3DTemporalVersion } from './3DTemporalVersion.js';

/**
 * Implements the tileset part of the 3DTILES_temporal
 * extension. See the spec in 
 * ./jsonSchemas/3DTILES_temporal.tileset.schema.json
 */
export class $3DTemporalTileset {
    constructor(json) {
        this.startDate = json.startDate;
        this.endDate = json.endDate;

        this.transactions = [];
        // Fill this.transactions
        this.parseTransactions(json.transactions); 

        this.temporalVersions = new $3DTemporalVersion(json.versions);
        this.versionTransitions = json.versionTransitions;
        
        // Trapped by 3DTemporalExtension.js that stores this instance of 
        // $3DTemporalTileset
        window.dispatchEvent(new CustomEvent(
            $3DTemporalTileset.TEMPORAL_TILESET_LOADED, 
            {detail: { temporalTileset: this}}));
    }

    /**
     * Parses transactions from a json file and creates primary and aggregated
     * transactions.
     * @param {Object} transactions The json holding the transactions.
     */
    parseTransactions(transactions) {
        for (let i = 0; i < transactions.length; i++) {
            let parsedTransac;
            if (transactions[i].type) {
                // Transactions aggregates don't have a type attribute
                parsedTransac = new $3DTemporalPrimaryTransaction(transactions[i]);
            } else if (transactions[i].transactions) {
                // Primary transactions don't have a transactions attribute
                parsedTransac = new $3DTemporalTransactionAggregate(transactions[i]);
                // Recursively parse the aggregated transactions.
                parsedTransac.transactions = this.parseTransactions(transactions[i].transactions);
            }
            this.transactions.push(parsedTransac);
        }
    }

    static get TEMPORAL_TILESET_LOADED() {
        return 'TEMPORAL_TILESET_LOADED';
      }
}
