import { getFirstTileIntersection, getBatchIdFromIntersection, getObject3DFromTile, getVisibleTileCount } from "../3DTiles/3DTilesUtils.js";


export class LayerManager {

    /**
       * Creates a new TilesManager from an iTowns view and the 3DTiles layer.
       * 
       * @param {*} view The iTowns view.
       */
    constructor(view) {
        /**
         * The iTowns view.
         */
        this.view = view;

        /**
         * The set of tiles Manager that have been loaded.
         * @type {Array<TilesManager>}
         */
        this.tilesManagers = [];
    }

    /**
     * Register a new or modify an existing registered style for all tilesManager.
     * 
     * @param {string} name A name to identify the style.
     * @param {CityObjectStyle} style The style to register.
     */
    registerStyle(name, style) {
        this.tilesManagers.forEach(function(tilesManager){
            tilesManager.registerStyle(name, style);
        });
    }

    /**
     * Removes all styles currently registered.
     */
    removeAll3DTilesStyles() {
        this.tilesManagers.forEach(function(tilesManager){
            tilesManager.removeAllStyles();
        });
    }

    /**
     * Applies the current styles added with `setStyle` or `addStyle`.
     * 
     * @param {object} options Options of the method.
     * @param {() => any} [options.updateFunction] The function used to update the
     * view. Default is `udpateITownsView(view, layer)`.
     */
    applyAll3DTilesStyles(options = {}) {
        this.tilesManagers.forEach(function(tilesManager){
            tilesManager.applyStyles(options);
        });
    }

    /**
    * Check if at least one 3DTiles layer is visible
    * 
    * @returns {boolean}
    */
    isOneLayerVisible() {
        for (let i = 0; i < this.tilesManagers.length; i++) {
            if (this.tilesManagers[i].layer.visible) {
                return true;
            }
        }
        return false;
    }

    /**
    * Change the visibilty of all 3DTiles layers 
    * 
    */
    changeVisibility(bool) {
        this.tilesManagers.forEach(function(tilesManager){
            tilesManager.layer.visible = bool ;
        });
    }

    /**
    * Update the scale of the given layer
    * @param {itowns.Layer} layer one layer loaded.
    * @param {float} scale Value of the new scale
    */
    updateScale(layer, scale) {
        layer.scale = scale;
        this.notifyChange();
    }

    /**
    * Update the opacity of the given layer
    * @param {itowns.Layer} layer one layer loaded.
    * @param {float} opacity Value of the new scale
    */
    updateOpacity(layer, opacity) {
        layer.opacity = opacity;
        this.notifyChange();
    }
    /**
    * Update the view when called. Must be called when a change have been made
    * The view.camera.camera3D is passed to actualize all of the layer, but the 
    * the documentation of notifyChange says taht it should not be needed 
    */
    notifyChange() {
        this.view.notifyChange(this.view.camera.camera3D);
    }

    /**
     * Returns the city object under the mouse cursor.
     * 
     * @param {MouseEvent} event The mouse event.
     * 
     * @returns {CityObject | undefined}
     */
    pickCityObject(event) {
        /**
        * Make sure the event is captured by a click listener attached 
        * to the div#viewerDiv, which contains the iTowns canvas. All click 
        * listeners should be instantiated this way as of iTowns 2.24.0
        */
        if (event.currentTarget.id.toUpperCase() === 'VIEWERDIV') {
            // Get the intersecting objects where our mouse pointer is
            let intersections = [];
            //As the current pickObjectsAt on all layer is not working, we need 
            //to call pickObjectsAt() for each layer.
            for (let i = 0; i < this.tilesManagers.length; i++) {
                intersections = intersections.concat(this.view.pickObjectsAt(
                    event,
                    5,
                    this.tilesManagers[i].layer
                ));
            }
            let firstInter = getFirstTileIntersection(intersections);
            if (!!firstInter) {
                let tilesManager = this.getTilesManagerByLayerID(firstInter.layer.id);
                let batchId = getBatchIdFromIntersection(firstInter);
                let tileId = getObject3DFromTile(firstInter.object).tileId;
                return tilesManager.tiles[tileId].cityObjects[batchId];
            }
        }
        return undefined;
    }

    /**
    * Returns a tilesManager given a layer ID.
    * 
    * @param {string} id the layer ID.
    * 
    * @returns {TilesManager}
    */
    getTilesManagerByLayerID(id) {
        for (let i = 0; i < this.tilesManagers.length; i++) {
            if (this.tilesManagers[i].layer.id === id)
                return this.tilesManagers[i];
        }
    }

    /**
    * Get all Layers loaded in the view.
    */
    getLayers() {
        return this.view.getLayers();
    }

    /**
   * Get the number of tiles that have been loaded, across all the tileset that 
   * have been loaded
   * 
   * @returns {int} 
   */
    getLoaded3DTilesTileCount() {
        let loadedTileCount = 0;
        for (let i = 0; i < this.tilesManagers.length; i++) {
            loadedTileCount += this.tilesManagers[i].loadedTileCount;
        }
        return loadedTileCount;
    }

    /**
   * Get the number of tiles across all the tileset 
   * 
   * @returns {int} 
   */
    getTotal3DTilesTileCount() {
        let totalTileCount = 0;
        for (let i = 0; i < this.tilesManagers.length; i++) {
            totalTileCount += this.tilesManagers[i].totalTileCount;
        }
        return totalTileCount;
    }

    /**
   * Get the number of tiles visible, across all the tileset that 
   * have been loaded
   * 
   * @returns {int} 
   */
    getVisible3DTilesTileCountFromLayers() {
        let visibleTileCount = 0;
        for (let i = 0; i < this.tilesManagers.length; i++) {
            visibleTileCount += getVisibleTileCount(this.tilesManagers[i].layer);
        }
        return visibleTileCount;
    }

    /**
   * Get Color layers in the view
   * 
   * @returns {Array<itown.ColorLayer>} 
   */
    getColorLayers() {
        return this.view.getLayers(layer => layer.isColorLayer);
    }


    /**
   * Get Elevation layers in the view
   * 
   * @returns {Array<itown.ElevationLayer>} 
   */
    getElevationLayers() {
        return this.view.getLayers(layer => layer.isElevationLayer);
    }


    /**
   * Get Geometry layers in the view
   * 
   * @returns {Array<itown.GeometryLayer>} 
   */
    getGeometryLayers() {
        return this.view.getLayers(layer => layer.isGeometryLayer);
    }


    /**
   * Get Geometry layers in the view, without the planar one
   * 
   * @returns {Array<itown.GeometryLayer>} 
   */
    getGeometryLayersWithoutPlanar() {
        return this.view.getLayers(layer => layer.id !== "planar"
            && layer.isGeometryLayer);
    }
}
