import { CityObjectStyle } from './Model/CityObjectStyle.js';
import { CityObjectID } from './Model/CityObject.js';
import { createTileGroups } from './3DTilesUtils.js';
import { Tile } from './Model/Tile.js';

/**
 * Class used to manage the styles of city objects.
 */
export class StyleManager {
  constructor() {
    /**
     * A dictionnary of styles identified by a string.
     * 
     * @type {Object.<string, CityObjectStyle>}
     */
    this.registeredStyles = {};

    /**
     * An array of anonymous styles. These are the style that are passed are
     * parameters to `setStyle` without beeing registered first.
     * 
     * @type {Array<CityObjectStyle>}
     */
    this.anonymousStyles = [];

    /**
     * Stores which city objects use which registered style. It maps the style
     * identifier with an array of tile IDs, mapped to arrays of batch IDs.
     * 
     * @type {Object.<string, Array<Object.<number, Array<number>>}
     */
    this.registeredStyleUsage = {};

    /**
     * Stores which city objects use which anonymous style. It maps the style
     * identifier with an array of tile IDs, mapped to arrays of batch IDs.
     * 
     * @type {Object.<number, Array<Object.<number, Array<number>>}
     */
    this.anonymousStyleUsage = {};

    /**
     * The association between city objects and their respective styles.
     * 
     * @type {Object.<number, Object.<number, number | string>>}
     */
    this.styleTable = {};

    /**
     * Optimization : store the materials in an array for each tile. This allows
     * us to call `createTileGroups` instead of the less efficient
     * `createTileGroupsFromBatchIDs`.
     * 
     * @type {Object.<number, Array<any>>}
     */
    this.tileBufferedMaterials = {};
  }

  /**
   * Register a style.
   * 
   * @param {string} name Name to register the style.
   * @param {CityObjectStyle} style The style to register.
   * 
   * @returns {boolean} A value representing wether an existing style has been
   * overwritten by this function. If this is the case, styles should be
   * re-applied.
   */
  registerStyle(name, style) {
    this._updateBufferedMaterials(name, style);

    let existing = this.isStyleRegistered(name);
    this.registeredStyles[name] = style;
    return existing;
  }
  
  /**
   * Check if a style is registered.
   * 
   * @param {string} name Name of the style. 
   * 
   * @returns {boolean} True if the style is registered, false either.
   */
  isStyleRegistered(name) {
    return this.registeredStyles[name] !== undefined ? true : false;
  }

  /**
   * Updates the buffer material when a named style is updated.
   * 
   * @private
   * 
   * @param {string} name Name of the registered style.
   * @param {CityObjectStyle} style The style to register.
   */
  _updateBufferedMaterials(name, style) {
    let previousStyle = this.registeredStyles[name];
    if (previousStyle !== undefined &&
      previousStyle._bufferedMaterialIndex !== undefined) {
      // Need to keep the buffered material
      style._bufferedMaterialIndex = previousStyle._bufferedMaterialIndex;
      for (let tileId of Object.keys(style._bufferedMaterialIndex)) {
        let index = style._bufferedMaterialIndex[tileId];
        this.tileBufferedMaterials[tileId][index] = style.materialProps;
      }
    }
  }

  /**
   * Get the style, either registered or anonymous.
   * 
   * @param {string|number} identifier The name (if registered) or ID of the
   * style (if anonymous).
   * 
   * @returns {CityObjectStyle}
   */
  getStyle(identifier) {
    if (typeof(identifier) === 'string') {
      return this.registeredStyles[identifier];
    } else if (typeof(identifier) === 'number') {
      return this.anonymousStyles[identifier];
    }
    throw 'Style identifier must be a string or a number';
  }

  /**
   * Sets the style of the given city object.
   * 
   * @param {CityObjectID | Array<CityObjectID>} cityObjectId One or many IDs of 
   * the city objects.
   * @param {CityObjectStyle | string} style The style to apply. Can be a
   * `CityObjectStyle` or a `string` refering a registered style.
   */
  setStyle(cityObjectId, style) {
    if (typeof(style) === 'string') {
      if (this.registeredStyles[style] === undefined) {
        throw `The style ${style} has not been registered.`;
      }
      this._setStyleInTable(cityObjectId, style);
    } else {
      let styleId = this._registerAnonymousStyle(style);
      this._setStyleInTable(cityObjectId, styleId);
    }
  }

  /**
   * Checks if the given style exists in the anonymous style array, and returns
   * the index if this is the case. Else, push the style in the anonymous style
   * array and returns the index.
   * 
   * @private
   * 
   * @param {CityObjectStyle} style The style to register.
   * @returns {number} The index of the style in the anonymous style array.
   */
  _registerAnonymousStyle(style) {
    if (! (style instanceof CityObjectStyle)) {
      try {
        style = new CityObjectStyle(style);
      } catch(_) {
        throw 'Style must be a CityObjectStyle.';
      }
    }

    let styleId = null;
    for (let [anonIndex, anonStyle] of this.anonymousStyles.entries()) {
      if (anonStyle.equals(style)) {
        styleId = anonIndex;
        break;
      }
    }
    if (styleId === null) {
      styleId = this.anonymousStyles.length;
      this.anonymousStyles.push(style);
    }
    return styleId;
  }

  /**
   * Sets the style for the given city object in the style table.
   * 
   * @private
   * 
   * @param {CityObjectID | Array<CityObjectID>} cityObjectId The city object
   * identifier, or an array of city object identifiers.
   * @param {number | string} styleIdentifier The style identifier.
   */
  _setStyleInTable(cityObjectId, styleIdentifier) {
    if (cityObjectId instanceof CityObjectID) {
      let tileId = cityObjectId.tileId;
  
      if (this.styleTable[tileId] === undefined) {
        this.styleTable[tileId] = {};
      }
      this.styleTable[tileId][cityObjectId.batchId] = styleIdentifier;
      this._bufferStyleMaterial(cityObjectId.tileId, styleIdentifier);
      this._registerUsage(styleIdentifier, cityObjectId);
    } else if (Array.isArray(cityObjectId)) {
      cityObjectId.sort((idA, idB) => {
        return idA.tileId - idB.tileId;
      });
      for (let id of cityObjectId) {
        if (this.styleTable[id.tileId] === undefined) {
          this.styleTable[id.tileId] = {};
        }
        this.styleTable[id.tileId][id.batchId] = styleIdentifier;
        this._bufferStyleMaterial(id.tileId, styleIdentifier);
        this._registerUsage(styleIdentifier, id);
      }
    } else {
      throw 'Invalid city object Identifier';
    }
  }

  /**
   * Stores the material of the style in the buffer.
   * 
   * @private
   * 
   * @param {number} tileId The tile ID.
   * @param {number | string} styleIdentifier The style identifier.
   */
  _bufferStyleMaterial(tileId, styleIdentifier) {
    if (this.tileBufferedMaterials[tileId] === undefined) {
      this.tileBufferedMaterials[tileId] = [];
    }
    let style = this.getStyle(styleIdentifier);
    let bufferedMaterialIndex;
    for (let index = 0; index < this.tileBufferedMaterials[tileId].length; index++) {
      let bufferedMaterial = this.tileBufferedMaterials[tileId][index];
      if (style.materialPropsEquals(bufferedMaterial)) {
        bufferedMaterialIndex = index;
        break;
      }
    }
    if (bufferedMaterialIndex === undefined) {
      bufferedMaterialIndex = this.tileBufferedMaterials[tileId].length;
      this.tileBufferedMaterials[tileId].push(style.materialProps);
    }

    if (style._bufferedMaterialIndex === undefined) {
      style._bufferedMaterialIndex = {};
    }
    style._bufferedMaterialIndex[tileId] = bufferedMaterialIndex;
  }

  /**
   * Removes the style associated with this city object.
   * 
   * @param {CityObjectID | Array<CityObjectID>} cityObjectId The city object
   * ID.
   */
  removeStyle(cityObjectId) {
    if (cityObjectId instanceof CityObjectID) {
      if (this.styleTable[cityObjectId.tileId] === undefined) {
        return;
      }
      this._removeUsage(this.styleTable[cityObjectId.tileId][cityObjectId.batchId],
        cityObjectId);
      delete this.styleTable[cityObjectId.tileId][cityObjectId.batchId];
    } else if (Array.isArray(cityObjectId)) {
      for (let id of cityObjectId) {
        this._removeUsage(this.styleTable[id.tileId][id.batchId], id);
        delete this.styleTable[id.tileId][id.batchId];
      }
    } else {
      throw 'Invalid City Object Identifier';
    }
  }

  /**
   * Removes the styles associated to the given tile.
   * 
   * @param {number} tileId ID of the tile to remove the style.
   */
  removeStyleFromTile(tileId) {
    if (this.styleTable[tileId] === undefined) {
      return;
    }
    let cityObjectIds = [];
    for (let batchId of Object.keys(this.styleTable[tileId])) {
      cityObjectIds.push(new CityObjectID(tileId, Number(batchId)));
    }
    
    delete this.tileBufferedMaterials[tileId];
    this.removeStyle(cityObjectIds);
  }

  /**
   * Resets all styles. This does not clear the registered styles, so you can
   * still use them afterwards.
   */
  removeAllStyles() {
    this.styleTable = {};
    this.anonymousStyleUsage = {};
    this.registeredStyleUsage = {};
    this.anonymousStyles = [];
    this.tileBufferedMaterials = {};
  }

  /**
   * Applies current saved styles to the tile.
   * 
   * @param {Tile} tile The tile.
   */
  applyToTile(tile) {
    if (this.styleTable[tile.tileId] !== undefined) {
      let materials = this.tileBufferedMaterials[tile.tileId] || [];
      let ranges = [];
      for (let batchId of Object.keys(this.styleTable[tile.tileId])) {
        let styleIdentifier = this.styleTable[tile.tileId][batchId];
        let style = this.getStyle(styleIdentifier);
        let cityObject = tile.cityObjects[Number(batchId)];

        ranges.push({
          start: cityObject.indexStart,
          count: cityObject.indexCount,
          material: style._bufferedMaterialIndex[tile.tileId]
        });
      }
      
      createTileGroups(tile.getObject3D(), materials, ranges);
    } else {
      // Clear the tile
      createTileGroups(tile.getMesh(), [], []);
    }
  }

  /**
   * Returns the list of tiles that have a style applied to them.
   * 
   * @returns {Array<number>}
   */
  getStyledTiles() {
    let tiles = [];
    for (let tileId of Object.keys(this.styleTable)) {
      if (tileId !== undefined && Object.keys(this.styleTable[tileId]).length > 0) {
        tiles.push(tileId);
      }
    }
    return tiles;
  }

  /**
   * Retrieves the list of objects that uses a given style.
   * 
   * @param {string | number} styleIdentifier The style identifier.
   * 
   * @returns {Object.<number, Array<number>>}
   */
  getStyleUsage(styleIdentifier) {
    if (typeof(styleIdentifier) === 'string') {
      return this.registeredStyleUsage[styleIdentifier];
    } else if (typeof(styleIdentifier) === 'number') {
      return this.anonymousStyleUsage[styleIdentifier];
    } else {
      throw 'A style identifier must be a string or a number.';
    }
  }

  /**
   * Gets the style applied to a given object ID.
   * 
   * @param {CityObjectID} cityObjectId The city object ID.
   * 
   * @returns {CityObjectStyle} The style for the specified city object. If
   * the city object identifier refers to an array of city objects, the style
   * for the first one is returned.
   */
  getStyleAppliedTo(cityObjectId) {
    if (this.styleTable[cityObjectId.tileId] === undefined) {
      return undefined;
    }

    if (this.styleTable[cityObjectId.tileId][cityObjectId.batchId]
      === undefined) {
      return undefined;
    }

    return this.getStyle(
      this.styleTable[cityObjectId.tileId][cityObjectId.batchId]);
  }

    /**
   * Gets the style identifier applied to a given object ID.
   * 
   * @param {CityObjectID} cityObjectId The city object ID.
   * 
   * @returns {CityObjectStyle} The style for the specified city object. If
   * the city object identifier refers to an array of city objects, the style
   * for the first one is returned.
   */
  getStyleIdentifierAppliedTo(cityObjectId) {
    if (this.styleTable[cityObjectId.tileId] === undefined) {
      return undefined;
    }

    if (this.styleTable[cityObjectId.tileId][cityObjectId.batchId]
      === undefined) {
      return undefined;
    }

    return this.styleTable[cityObjectId.tileId][cityObjectId.batchId];
  }
  /**
   * Keeps track of the style usage.
   * 
   * @private
   * 
   * @param {string | number} styleIdentifier The style identifier.
   * @param {CityObjectID} cityObjectId The city object ID.
   */
  _registerUsage(styleIdentifier, cityObjectId) {
    const tileId = cityObjectId.tileId;
    const batchId = cityObjectId.batchId;

    if (typeof(styleIdentifier) === 'string') {
      if (this.registeredStyleUsage[styleIdentifier] === undefined) {
        this.registeredStyleUsage[styleIdentifier] = {};
      }
      if (this.registeredStyleUsage[styleIdentifier][tileId] === undefined) {
        this.registeredStyleUsage[styleIdentifier][tileId] = [];
      }
      this.registeredStyleUsage[styleIdentifier][tileId].push(batchId);
    } else if (typeof(styleIdentifier) === 'number') {
      if (this.anonymousStyleUsage[styleIdentifier] === undefined) {
        this.anonymousStyleUsage[styleIdentifier] = {};
      }
      if (this.anonymousStyleUsage[styleIdentifier][tileId] === undefined) {
        this.anonymousStyleUsage[styleIdentifier][tileId] = [];
      }
      this.anonymousStyleUsage[styleIdentifier][tileId].push(batchId);
    } else {
      throw 'A style identifier must be a string or a number.';
    }
  }

  /**
   * Removes the track of the style usage.
   * 
   * @private
   * 
   * @param {string | number} styleIdentifier The style identifier.
   * @param {CityObjectID | Array<CityObjectID>} cityObjectId The city object
   * ID.
   */
  _removeUsage(styleIdentifier, cityObjectId) {
    if (cityObjectId instanceof CityObjectID) {
      this._removeUsageInTables(styleIdentifier, cityObjectId);
    } else if (Array.isArray(cityObjectId)) {
      for (let id of cityObjectId) {
        this._removeUsageInTables(styleIdentifier, id);
      }
    } else {
      throw 'Invalid City Object Identifier';
    }
  }
  
  /**
   * Removes the track of the style for one single city object.
   * 
   * @param {string | number} styleIdentifier The style identifier
   * @param {CityObjectID} cityObjectId The city object ID.
   */
  _removeUsageInTables(styleIdentifier, cityObjectId) {
    let tileId = cityObjectId.tileId;
    let batchId = cityObjectId.batchId;
    if (typeof(styleIdentifier) === 'string') {
      let index = this.registeredStyleUsage[styleIdentifier][tileId].findIndex(
        bId => bId === batchId);
      this.registeredStyleUsage[styleIdentifier][tileId].splice(index, 1);
      if (this.registeredStyleUsage[styleIdentifier][tileId].length === 0) {
        delete this.registeredStyleUsage[styleIdentifier][tileId];

        if (Object.keys(this.registeredStyleUsage[styleIdentifier])
          .length === 0) {
          delete this.registeredStyleUsage[styleIdentifier];
        }
      }
    } else if (typeof(styleIdentifier) === 'number') {
      let index = this.anonymousStyleUsage[styleIdentifier][tileId].findIndex(
        bId => bId === batchId);
      this.anonymousStyleUsage[styleIdentifier][tileId].splice(index, 1);
      if (this.anonymousStyleUsage[styleIdentifier][tileId].length === 0) {
        delete this.anonymousStyleUsage[styleIdentifier][tileId];

        if (Object.keys(this.anonymousStyleUsage[styleIdentifier])
          .length === 0) {
          delete this.anonymousStyleUsage[styleIdentifier];
        }
      }
    } else {
      throw 'A style identifier must be a string or a number.';
    }
  }
}