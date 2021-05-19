//Components
import { TilesManager } from '../../../Components/3DTiles/TilesManager.js'
import { getVisibleTiles } from '../../../Components/3DTiles/3DTilesUtils.js';
import { CityObjectStyle } from '../../../Components/3DTiles/Model/CityObjectStyle.js';
import { CityObjectID } from '../../../Components/3DTiles/Model/CityObject.js';

/**
 * The ViewModel of the temporal module. Contains intermediate data structures
 * between the model and the view as well as the logic for city objects and 
 * transactions display.
 */
export class TemporalProvider {
    /**
     * Constructs a new temporal provider: initialize data structures
     * used for the view (this.COStyles), initialize the possible
     * city objects styles that displays transactions and set events. 
     * @param {$3DTemporalExtension} tempExtModel The model of the temporal
     * module (i.e. holding data from the 3D Tiles temporal extension).
     * @param {TilesManager} tilesManager The tiles manager associated 
     * with the itowns 3D Tiles layer holding the temporal extension.
     * @param {Number} currentTime The current display time, updated by the 
     * TemporalView.
     */
  constructor(tempExtModel, tilesManager, currentTime) {
    
    this.tempExtModel = tempExtModel;

    this.tilesManager = tilesManager;

    this.currentTime = currentTime;

    /** Stores city objects (CO) styles per tile and per date 
     * to avoid computing it multiple times. It's actually a map 
     * of a map and its structure is:
     * { date: tile : styles[] } } where the position in the styles 
     * array is the id of the city object
     * */ 
    this.COStyles = new Map();

    this.initCOStyles();

    // Initializes the model. One part of this model is filled when the
    // temporal extension is loaded by iTowns; an other part is filled 
    // with the event declared below (when a tile is loaded).
    // See the comment at the end of the $3DTemporalExtension constructor
    // for more details.
    this.tilesManager.addEventListener(
      TilesManager.EVENT_TILE_LOADED,
      this.tempExtModel.updateTileExtensionModel.bind(
        this.tempExtModel));

    // When a tile is loaded, we compute the state of its city objects (e.g.
    // should they be displayed or not and in which color, etc.)
    this.tilesManager.addEventListener(
      TilesManager.EVENT_TILE_LOADED, 
      this.changeTileState.bind(this));
  }

  /**
   * Initializes the styles affected to city objects to represent 
   * transactions (see 3DTiles_temporal extension for more information
   * on transactions). The names of the styles match transaction names,
   * except for 'noTransaction' dans 'hide'.
   */
  initCOStyles() {
    this.tilesManager.registerStyle('noTransaction', new CityObjectStyle({
        materialProps: { opacity: 1.0, color: 0xffffff } })); // white

    this.tilesManager.registerStyle('creation', new CityObjectStyle({
        materialProps: { opacity: 0.6, color: 0x009900 } })); // green

    this.tilesManager.registerStyle('demolition', new CityObjectStyle({
        materialProps: { opacity: 0.6, color: 0xff0000 } })); // red

    this.tilesManager.registerStyle('modification', new CityObjectStyle({
        materialProps: { opacity: 0.6, color: 0xFFD700 } })); // yellow

    this.tilesManager.registerStyle('hide', new CityObjectStyle({
        materialProps: { opacity: 0, color: 0xffffff, alphaTest: 0.3 } })); // hidden
  }

  /**
   * Sets the style of a given city object in the tiles manager if this
   * style has been registered in the tiles manager (e.g. in 
   * this.initCOStyles()). 
   * @param {Number} tileId Id of the tile of the city object.
   * @param {Number} cityObjectId Id of the city object.
   * @param {String} styleName Name of the style to apply.
   */
  setCityObjectStyle(tileId, cityObjectId, styleName) {
    if(this.tilesManager.isStyleRegistered(styleName)) {
        this.tilesManager.setStyle(new CityObjectID(tileId, cityObjectId), 
        styleName);
    } else {
        console.warn("Style " +  styleName + " is not " + 
        "registered. Defaulting to style noTransaction.")
        this.tilesManager.setStyle(new CityObjectID(tileId, cityObjectId), 
        'noTransaction');
    }
  }

    /**
     * Generates the style name of a transaction. This method is recursive
     * for aggregated transactions that may have multiple nested transactions. 
     * The style name correspond to the one created in the 
     * initCOStyles method).
     * 
     * @param {$3DTemporalTransaction} transaction The transaction 
     * to generate the style name from.
     * 
     * @returns {string} If the transaction is a primary transaction, 
     * returns its type. If it is an aggregated transaction, it returns a
     * concatenation of the primary transactions types aggregated in 
     * transaction, prefixed by 'aggregate'. Currently, no style are 
     * declared for transactions aggregates for a simpler visual 
     * rendering. We could also generate styles with random colors
     * and add them to a legend and provide a user the possibility to
     * update these colors and / or to disable them from the GUI.
     */
    getTransactionStyleName(transaction, styleName) {
        if (transaction.isPrimary) return transaction.type;
        else if (transaction.isAggregate) {
            if (styleName === '') styleName = 'aggregate'; // prefix
            for (let i = 0 ; i < transaction.transactions.length ; i++) {
                styleName = styleName + '-' + this.getTransactionStyleName(
                    transaction.transactions[i], styleName);
            }
            return styleName
        } else {
            console.warn('Transaction which is not a primary nor an aggregate.')
        }
    }

    /* *** Culling with transactions and colors management     */
    // Rules for culling:
    //   * If the feature exists at the currentTime we display it in gray
    //   * If there is a transaction between the feature and another
    //   feature at the currentTime:
    //      * the displayed geometry is the one of the old feature for the
    //      first half duration of the transaction
    //      * the displayed geometry is the one of the new feature for the
    //      second half of the duration
    //      * the opacity is set to 0.6
    //      * the color is set depending on the transaction type
    //   * else we hide the feature.
    culling(BT, tileId, tileTransactions) {
      const featuresDisplayStates = [];
      for (let i = 0; i < BT.featureIds.length; i++) {
          const featureId = BT.featureIds[i];
          if (this.currentTime >= BT.startDates[i] && this.currentTime <=
            BT.endDates[i]) {
              // ** FEATURE EXISTS
              featuresDisplayStates.push('noTransaction');
              this.setCityObjectStyle(tileId, i, 'noTransaction');
          } else if (tileTransactions.has(featureId) && tileTransactions.get(featureId)) {
              // ** TRANSACTION CASE
              const featureTransactions = tileTransactions.get(featureId);
              let hasTransac = false;
              if (featureTransactions.asSource) {
                  const transacAsSource = featureTransactions.asSource
                  const transacAsSourceHalfDuration = (transacAsSource.endDate -
                      transacAsSource.startDate) / 2;
                  if (this.currentTime > transacAsSource.startDate && this.currentTime <=
                      transacAsSource.startDate + transacAsSourceHalfDuration) {
                      hasTransac = true;
                      const transactionStyleName = this.getTransactionStyleName(transacAsSource, '');
                      featuresDisplayStates.push(transactionStyleName);
                      this.setCityObjectStyle(tileId, i, transactionStyleName);
                  }
              }
              if (featureTransactions.asDestination) {
                const transacAsDest = featureTransactions.asDestination;
                  const transacAsDestHalfDuration = (transacAsDest.endDate -
                      transacAsDest.startDate) / 2;
                  if (this.currentTime > transacAsDest.startDate +
                      transacAsDestHalfDuration && this.currentTime <=
                      transacAsDest.endDate) {
                      hasTransac = true;
                      const transactionStyleName = this.getTransactionStyleName(transacAsDest, '');
                      featuresDisplayStates.push(transactionStyleName);
                      this.setCityObjectStyle(tileId, i, transactionStyleName);
                  }
              }

              if (!hasTransac) {
                  // ** TRANSACTION NOT AT THE RIGHT DATE
                  featuresDisplayStates.push('hide');
                  this.setCityObjectStyle(tileId, i, 'hide');
              }
          } else {
              // ** FEATURE DOES NOT EXIST AND THERE IS NO TRANSACTION

              // ** MANAGE CREATIONS AND DEMOLITIONS (this step must be
              // done because the creation and demolitions transactions
              // are currently not in the tileset. However, the tileset
              // should have them later on).
              const halfVintage = 1.5;

              if (this.currentTime + halfVintage >= BT.startDates[i] &&
                  this.currentTime < BT.startDates[i]) {
                  // ** CREATION
                  featuresDisplayStates.push('creation');
                  this.setCityObjectStyle(tileId, i, 'creation');
              } else if (this.currentTime - halfVintage < BT.endDates[i] &&
                  this.currentTime > BT.endDates[i]) {
                  // ** DEMOLITION
                  featuresDisplayStates.push('demolition');
                  this.setCityObjectStyle(tileId, i, 'demolition');
              } else {
                  // ** FEATURE DOES NOT EXIST
                  featuresDisplayStates.push('hide');
                  this.setCityObjectStyle(tileId, i, 'hide');
              }
          }
      }

      return featuresDisplayStates;
  }

  /**
   * Computes and sets the style of the features of a given tile. 
   * @param {Number} tileId The id of the given tile.
   */
  computeTileState(tileId) {
    // Compute features states
    if (tileId === 0) return; // Skip the root tile which has no geometry

    // If it has already been computed, don't do it again
    if (this.COStyles.has(this.currentTime) &&
        this.COStyles.get(this.currentTime).has(tileId)) {
        const tileDisplayStates = this.COStyles.get(this.currentTime).get(tileId);
        for (let i = 0 ; i < tileDisplayStates.length ; i++) {
            this.setCityObjectStyle(tileId, i, tileDisplayStates[i]);
        }
    } else {
        if (this.tempExtModel.temporalBatchTables.has(tileId)) {
            const tileTemporalBT = this.tempExtModel.temporalBatchTables.get(tileId);
            if (! this.COStyles.has(this.currentTime)) {
                this.COStyles.set(this.currentTime, new Map());
            }
            this.COStyles.get(this.currentTime).set(tileId, this.culling(tileTemporalBT, tileId, this.tempExtModel.transactionsPerTile.get(tileId)));
        } else {
        console.warn(`Cannot compute features states for tile ${tileId}  
        since the temporal extension of the batch table has not yet been 
        loaded for this tile`);
        return;
        }
    }
  }

  /**
   * Computes and applies the display state of a tile. This method
   * is triggered by an event (TilesManager.EVENT_TILE_LOADED) 
   * indicating that a new tile content has been loaded (e.g. because it 
   * becomes visible by the camera)
   * @param {Object} tileContent The tile content loaded.
   */
  changeTileState(tileContent) {
      this.computeTileState(tileContent.tileId);
      this.tilesManager.applyStyleToTile(tileContent.tileId, 
        { updateView: false });
  } 

  /**
   * Computes and applies the display state of currently visible tiles 
   * (i.e. those in the camera field of view and having features 
   * at the current display time). This method is triggered by the 
   * TemporalView when the time of the view is updated.
   */
  changeVisibleTilesStates() {
      const tiles = getVisibleTiles(this.tilesManager.layer);
      for (let i = 0; i < tiles.length; i++) {
          this.computeTileState(tiles[i].tileId);
      }
      this.tilesManager.applyStyles();
  }

}