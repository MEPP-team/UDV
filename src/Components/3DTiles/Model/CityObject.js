import { Tile } from "./Tile.js";
import * as THREE from 'three';

/**
 * Represents a city object.
 */
export class CityObject {
  /**
   * Constructs a city object from the given parameters.
   * 
   * @param {Tile} tile The tile holding the city object.
   * @param {number} batchId Batch ID of the city object in the tile.
   * @param {number} indexStart Start index of the vertex array in the tile.
   * @param {number} [indexCount] Number of vertices corresponding to this batch
   * ID in the tile.
   * @param {THREE.Vector3} [centroid] Centroid of the geometry.
   * @param {Object} [props] Properties from the batch table.
   */
  constructor(tile, batchId, indexStart, indexCount, centroid, props) {
    /**
     * The tile holding the city object.
     * 
     * @type {Tile}
     */
    this.tile = tile;

    /**
     * Batch ID of the city object in the tile.
     * 
     * @type {number}
     */
    this.batchId = batchId;

    /**
     * The city object ID.
     * 
     * @type {CityObjectID}
     */
    this.cityObjectId = new CityObjectID(this.tile.tileId, this.batchId);

    /**
     * Start index of the vertex array in the tile.
     * 
     * @type {number}
     */
    this.indexStart = indexStart;

    /**
     * Number of vertices corresponding to this batch ID in the tile.
     * 
     * @type {number}
     */
    this.indexCount = indexCount || 0;

    /**
     * Centroid of the geometry.
     * 
     * @type {THREE.Vector3}
     */
    this.centroid = centroid;

    /**
     * Properties from the batch table.
     * 
     * @type {Object}
     */
    this.props = props || {};
  }

  /**
   * Last index of the vertex array.
   */
  get indexEnd() {
    return this.indexStart + this.indexCount - 1;
  }
}

/**
 * Creates a CityObjectID from an anonymous object.
 * 
 * @param {{tileId: number, batchId: number | Array<number>}} object A
 * dictionnary with two keys, `tileId` and `batchId`.
 * 
 * @returns {CityObjectID}
 */
export function createCityObjectID(object) {
  if (object === undefined || typeof(object.tileId) !== 'number'
    || (typeof(object.batchId) !== 'number' && !Array.isArray(object.batchId))) {
    throw 'A city object must have a tileId and a batchId';
  }

  return new CityObjectID(object.tileId, object.batchId);
}

/**
 * Represents an identifier for one or more city objects. This class can be used
 * to represent :
 * 
 * - a single city object.
 * - a set of city objects in a same tile.
 */
export class CityObjectID {
  /**
   * Constructs a city object ID.
   * 
   * @param {number} tileId The parent tile ID.
   * @param {number} batchId The batch ID in the tile.
   */
  constructor(tileId, batchId) {
    /**
     * The parent tile ID.
     * 
     * @type {number}
     */
    this.tileId = tileId;

    /**
     * The batch ID in the parent tile.
     * 
     * @type {number}
     */
    this.batchId = batchId;
  }

  /**
   * Converts the city object ID into a string, making the class usable as
   * a dictionnary key.
   * 
   * @returns {string}
   */
  toString() {
    return `CityObject-${this.tileId}-${this.batchId}`;
  }
}