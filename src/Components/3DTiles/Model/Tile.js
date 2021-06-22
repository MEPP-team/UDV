import * as THREE from 'three';
import { CityObject } from './CityObject.js';
import { getTileInLayer } from '../3DTilesUtils.js';

/**
 * Represents a tile from 3DTiles. It holds a reference to the tile ID and the
 * root of all tiles (which should always be loaded in the view ?).
 */
export class Tile {
  /**
   * Constructs a Tile from the layer and a tile ID. The tile should 
   * not necessarily be loaded in the view when calling the constructor.
   * 
   * @param {*} layer The layer.
   * @param {number} tileId The ID of the tile to wrap.
   */
  constructor(layer, tileId) {
    if (!layer.isLayer) {
      throw 'Invalid tileset';
    }

    /**
     * A reference to the layer
     * 
     * @type {*}
     */
    this.layer = layer;

    /**
     * The tile ID in the tileset.
     * 
     * @type {number}
     */
    this.tileId = tileId;

    /**
     * Array of city objects contained by the tile. It is `null` by default and
     * should be instantiated by calling `loadCityObjects`.
     * 
     * @type {Array<CityObject>}
     */
    this.cityObjects = null;

    /**
     * The batch table.
     * 
     * @type {*}
     */
    this.batchTable = null;
  }

  /**
   * Returns the Object3D representing the tile. This is the root object of the
   * tile and it contains the batch table.
   * 
   * @returns {THREE.Object3D}
   */
  getObject3D() {
    return getTileInLayer(this.layer, this.tileId);
  }

  /**
   * Returns the Mesh of the tile. The Mesh contains the geometry and the
   * material properties.
   * 
   * @returns {THREE.Mesh}
   */
  getMesh() {
    return this.getObject3D().children[0].children[0];
  }

  /**
   * Checks if the tile is currently visible in the scene, ie. if an Object3D
   * with the same ID is present in the tileset.
   * 
   * @returns {boolean}
   */
  isVisible() {
    return this.getObject3D() !== undefined;
  }

  /**
   * Checks if the `cityObjects` attribute has been filled with city objects.
   * 
   * @returns {boolean}
   */
  isLoaded() {
    return this.cityObjects !== null;
  }

  /**
   * Checks whether the batch table have a specifc attribute
   * @param {String} attributeName 
   * @returns {boolean}
   */
  asAttributeInBatchTable(attributeName) {
    return attributeName in this.batchTable.content;
  }
  /**
   * If visible, parse the Object3D and the Mesh of the tile to create the
   * city objects.
   */
  loadCityObjects() {
    if (this.isLoaded()) {
      // The city objects have already been loaded, nothing to do.
      return;
    }

    let object3d = this.getObject3D();
    if (object3d === undefined) {
      // The tile is not in the view, nothing to do.
      return;
    }

    let mesh = this.getMesh();
    let attributes = mesh.geometry.attributes;
    let totalVertices = attributes._BATCHID.count;

    this.cityObjects = [];
    this.batchTable = object3d.batchTable;
    
    let newbatchIds = [];
    // For each vertex get the corresponding batch ID
    for (let vertexIndex = 0; vertexIndex < totalVertices; vertexIndex += 1) {
      let batchId = attributes._BATCHID.array[vertexIndex];

      // Creates a dict entry for the batch ID
      if (this.cityObjects[batchId] === undefined) {
        this.cityObjects[batchId] = new CityObject(this, batchId, vertexIndex);

        for (let key of Object.keys(this.batchTable.content)) {
          this.cityObjects[batchId].props[key] =
            this.batchTable.content[key][batchId];
        }

        newbatchIds.push(batchId);
      }

      // If this is the last vertex corresponding to this batch ID
      if (vertexIndex + 1 === totalVertices ||
        attributes._BATCHID.array[vertexIndex + 1] !== batchId) {
        this.cityObjects[batchId].indexCount =
          vertexIndex - this.cityObjects[batchId].indexStart + 1;
      }
    }

    // For each newly added tile part, compute the centroid
    for (let batchId of newbatchIds) {
      let vertexSum = new THREE.Vector3(0, 0, 0);
      let positionArray = mesh.geometry.attributes.position.array;
      for (let i = this.cityObjects[batchId].indexStart; i <= this.cityObjects[batchId].indexEnd; ++i) {
        vertexSum.x += positionArray[i * 3    ];
        vertexSum.y += positionArray[i * 3 + 1];
        vertexSum.z += positionArray[i * 3 + 2];
      }
      let vertexCount = this.cityObjects[batchId].indexCount;
      this.cityObjects[batchId].centroid =
        vertexSum.divideScalar(vertexCount).applyMatrix4(mesh.matrixWorld);
    }
  }
}