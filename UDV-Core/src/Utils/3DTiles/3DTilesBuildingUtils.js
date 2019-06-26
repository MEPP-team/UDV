import { setTileVerticesColor, getBatchIdFromIntersection,
  getBatchTableFromTile, 
  getTileInLayer} from "./3DTilesUtils";

/**
 * Gets a building ID from an intersection. The intersection's object must
 * be a "Mesh" object with a batch id.
 * 
 * @param {*} inter An intersection
 */
export function getBuildingIdFromIntersection(inter) {
  let table = getBatchTableFromTile(inter.object);
  let bid = getBatchIdFromIntersection(inter);
  return table.content['cityobject.database_id'][bid];
}

/**
 * Creates a Tile Building Info (TBI) dictionnary from a 3DTiles Layer.
 * The TBI is an object containing associations between Building Ids and
 * building-specific elements (mainly, the associated tile and the set of
 * batch array indexes).
 * 
 * @param {*} layer The 3DTiles layer.
 * @param {*} tbi An existing TBI for this layer. Tiles that are currently
 * loaded in the layer will be added to the TBI if they're not already present.
 * If no TBI is provided, a brand new one will be instantiated with currently
 * loaded tiles.
 * 
 * @example
 * let layer = view.getLayerById('3d-tiles-layer');
 * //Fetch the TBI
 * let tbi = getTilesBuildingInfo(layer);
 * //Get a building ID from the mouse position
 * let intersections = view.pickObjectsAt(mouseEvent, 5);
 * let buildingId = getBuildingIdFromIntersection(
 *                   getFirst3dObjectIntersection(intersections));
 * //Display the building's infos
 * console.log(tbi.buildings[buildingId]);
 * 
 * @example
 * let layer = view.getLayerById('3d-tiles-layer');
 * //Initialize the TBI
 * let tbi = getTilesBuildingInfo(layer);
 * //When the visible tiles change, update the TBI
 * tbi = getTilesBuildingInfo(layer, tbi);
 */
export function getTilesBuildingInfo(layer, tbi = null) {
  // Instantiate the TBI if it does not exist
  if (!tbi) {
    tbi = {};
    tbi.totalTileCount = 0;
    tbi.loadedTileCount = 0;
    tbi.loadedTiles = {};
    tbi.buildings = {};
    tbi.tileset;
  }
  let tileIndex = layer.tileIndex;
  let tileCount = tileIndex.index['1'].children.length;
  tbi.totalTileCount = tileCount;
  let tsroot = layer.object3d.children[0];
  tbi.tileset = tsroot;
  for (let tile of tsroot.children) {
    let tileId = tile.tileId;
    if (!tbi.loadedTiles[tileId]) {
      let batchTable = tile.batchTable;
      let attributes = tile.children[0].children[0].geometry.attributes;
      attributes._BATCHID.array.forEach((batchId, arrayIndex) => {
        let buildingId = batchTable.content['cityobject.database_id'][batchId];
        if (!tbi.buildings[buildingId]) {
          tbi.buildings[buildingId] = {};
          tbi.buildings[buildingId].arrayIndexes = [];
          tbi.buildings[buildingId].tileId = tile.tileId;
        }
        tbi.buildings[buildingId].arrayIndexes.push(arrayIndex);
      });
      tbi.loadedTiles[tileId] = true;
      tbi.loadedTileCount += 1;
    }
  }
  return tbi;
}

/**
 * Searches buiding information in the 3DTiles layer, from a building ID.
 * This function searches for all batch attributes in the layer that matches
 * the building ID. The search is done tile by tile, and once a matching
 * building ID is found, the search stops after the current tile.
 * 
 * This function is extremely unefficient. You may prefer using a TBI to
 * store building information and using it when needed. See
 * `getTilesBuildingInfo`.
 * 
 * @param {*} layer The 3DTiles layer.
 * @param {*} buildingId The building ID.
 */
export function searchBuildingInfo(layer, buildingId) {
  let buildingInfo = undefined;
  let tsroot = layer.object3d.children[0];
  for (let tile of tsroot.children) {
    let batchTable = tile.batchTable;
    let attributes = tile.children[0].children[0].geometry.attributes;
    attributes._BATCHID.array.forEach((batchId, arrayIndex) => {
      let bId = batchTable.content['cityobject.database_id'][batchId];
      if (buildingId === bId) {
        if (!buildingInfo) {
          buildingInfo = {};
          buildingInfo.arrayIndexes = [];
          buildingInfo.tileId = tileId;
        }
        buildingInfo.arrayIndexes.push(arrayIndex);
      }
    });
    // A building is only present in one tile
    if (!!buildingInfo && !!buildingInfo.tile) {
      return buildingInfo;
    }
  }
  return buildingInfo;
}

/**
 * Sets the color of one building in the scene.
 * 
 * @param {*} layer The 3DTiles layer.
 * @param {*} buildingInfo The building info.
 * @param {Array<number>} color The color.
 */
export function colorBuilding(layer, buildingInfo, color) {
  let tile = getTileInLayer(layer, buildingInfo.tileId);
  setTileVerticesColor(tile, color, buildingInfo.arrayIndexes);
}