This document is about the following files :

* [3DTilesUtils](./3DTilesUtils.js)
* [3DTilesBuildingUtils](./3DTilesBuildingUtils.js)

# Helper functions for 3DTiles

In order to easily access the 3DTiles tiles in the scene, along with the objects within them, we provide a utility file containing helper functions. These functions allow for example to easily retrieve a tile and access the batche table and IDs when the user clicks somewhere.

The functions are segregated in two files :

- `3DTilesUtils` contains generic 3DTiles functions. They can be used in any 3DTiles context with iTowns.
- `3DTilesBuildingUtils` contains functions that interact with 'building IDs'. A building ID is a unique identifier for a building in the scene. It's an attribute that we added in batch tables because of our goal to interact with specific buildings.

## Table of contents

1. [Data structures](#data-structures)
2. [3DTilesUtils](#3DTilesUtils)
3. [3DTilesBuildingUtils](#3DTilesBuildingUtils)
4. [Code examples](#Code-examples)

## Data structures

### Tile

A 3DTiles tile is represented in THREE.js (thus in iTowns) by a THREE.js "Object3D". It contains one child of type "Scene", which contains another child of type "Mesh".

The useful data about the Tile are located in the "Object3D" and the "Mesh" nodes of the hierarchy.

- The "Object3D" node contains the batch table (property `batchTable`).
- The "Mesh" node contains the geometry (`geometry`) and the material (`material`). `geometry` is of type BufferGeometry, which allows it to contain BufferAttributes (`attributes`). A useful attribute is the `_BATCHID` array, which maps each vertex of the tile with its associated batch id.

Below is a schematic summary of the layer object hierarchy :

```
Object3D
├─ Batch Table
└─ Scene
   └─ Mesh
      ├─ Material (color, etc.)
      └─ Geometry
         └─ Attributes (Batch IDs, positions, colors)
```

### Layer

A layer is used by iTowns to group together similar type of data. In our case, the only layer we care about is the 3DTiles one. It can be fetched from the iTowns `View` object with the `getLayerById` method :

```js
let layer = view.getLayerById(config['3DTilesLayerID']);
```

The 3DTiles layer has an `object3d` which contains exactly one child of type "Object3D". This child is actually the tileset root, and contains the tiles that are currently displayed in the scene.

The layer also has a `tileset` property which describes all tiles. Every tile is listed here, even if they are not rendered in the scene for the moment. However, the THREE.js actual objects representing the tiles are not there.

### Batch Table

The batch table objects represent a 3DTiles batch table. It has two attributes :

- `batchLength` refers to the total number of different batch IDs in the tile.
- `content` is a dictonnary mapping each attribute of the batch table to an array of values, where the indexes of the array are the batch IDs of the corresponding objects.

Below is an example batch table with one attribute, called "cityobject.database_id".

![Batch table example](batch_table_example.png)

### Geometry attributes

In the "Mesh" node of the tile hierarchy is stored the geometry of the tile, along with "geometry attributes". These attributes are actually THREE.js BufferAttributes used to describe the geometry. They are represented by arrays of size N * S, where N is the number of vertices in the scene and S is the size of the attribute items.

For example, to represent the position of each vertex, an item of size 3 is used (because a position is described by 3 values : x, y and z). If our tile contains 10 vertices, the `position` attribute has an array of size 30. The position of the first vertex is described by the elements at index 0, 1 and 2 of the attribute array (respectively for x, y and z values).

The commonly used attributes are the following :

- `_BATCHID` is an attribute with an item size 1. Each vertex has a batch ID associated to it, and vertices can be grouped under the same batch ID (useful to represent a coherent set of vertices, like a building). Be careful however, because the batch IDs are not unique accross the tiles.
- `position` has an item size of 3. It represents the coordinates of the vertices.
- `color` has an item size of 3. It represents the color of the vertices. By default, this value is not used to render the shape because the material of the tile has its own color. To override this behaviour and use the color of each vertex, we must set the `vertexColors` property of the material to `THREE.VertexColors`.

### Building

A building is a set of 3DTiles vertices, characterized by a common building ID. It often represents a "real life building".

### Tiles Information (TI)

In our application, we often need to interact with buildings rather than whole tiles. To do that, we have batch IDs identifiying specific parts of a tile (which has a tile ID). We also have building IDs in batch tables, used to link buildings with actual vertices of the tiles. The Tiles Information object (short : TI) is used to easily access building-specific information without searching in every tile.

The TI has serveral useful properties :

- `tiles` store each tile that was explored by the TI. Each tile is an array, mapping batch IDs to building information. A building information object contains a few properties :
  - `arrayIndexes` stores the indexes of the vertices of the building
  - `tileId` references the tile in which the building is stored
  - `batchId` is the batch ID of the building
  - `centroid` contains the centroid of the geometry
  - `props` is a dictionnary that contains the same information as the batch table, related to this building. For example, what we call a building ID is stored here under the name "cityobject.database_id".
- `loadedTileCount` is the size of `loadedTiles`.
- `totalTileCount` is the total number of tiles in the tileset.

## 3DTilesUtils

Below are listed the utility functions used to interact with 3DTiles data.

### `getBatchTableFromTile(tile)` - Retrieve a batch table from a tile

This function is used to get the batch table of a tile. This is handy because the `tile` parameter can be either the "Object3D", the "Scene" or the "Mesh" node of the tile.

### `getBatchIdFromIntersection(inter)` - Get a batch ID from an intersection

The function allows to find a batch ID corresponding to the intersecting object of an intersection. This is useful when coupled with the `View.pickObjectsAt` method of iTowns, which returns an array of intersections.

### `getFirstTileIntersection(intersections)` - Gets a tile from an intersection array

The function iterates over an array of intersections and return the first one where the intersecting object is a 3DTiles tile.  
The `View.pickObjectsAt` method is handy but returns an array of intersections, where intersecting objects are not always 3DTiles elements. In this case, this function may be convenient to get the first interesting intersection.

### `getVisibleTiles(layer)` - Returns all tiles currently rendered on the scene

This function explores the tileset tree to find all tiles that are currently rendered. The result is returned as an array rather than a tree (the parent-child structure is however kept thanks to the `parent` and `children` properties of the tiles).

### `getVisibleTileCount(layer)` - Counts how many tiles are displayed on the scene

This function is relatively straightforward. It simply counts the number of tiles are currently rendered on the scene.

### `setTileVerticesColor(tile, newColor, indexArray)` - Colors vertices of a tile

This function is used to set the color of the vertices of a tile. It does not affect the material color, but rather the geometry 'color' attribute. The default color rendering method is also changed (the `vertexColors` property of the material is set to `THREE.VertexColors`).  
It is possible to change the color of specific vertices of the tile. They are specified in the optional `indexArray` parameter, which is an array of indexes for the vertices (same indexes used in the `_BATCHID` attribute, for example).

### `createTileGroups(tile, materials, ranges)` - Create tile groups and set materials

This function is used to group the vertices of the tile into different "groups". A group is a set of consecutive vertices with the same material. This function can be used to change the material (color, opacity, etc.) of different parts of the tile.  
Different materials can be used at the same time.

### `createTileGroupsFromBatchIDs(tile, groups)` - Create tile groups from batch IDs

This function serves as a convenient helper to create tile groups without specifying vertex ranges, but rather batch IDs. Batch IDs are much simpler to manipulate and retrieve, with for example the `pickObjectsAt` function.

### `removeTileVerticesColor(tile)` - Remove the color from tile vertices

This function removes the `color` attribute from the geometry of the tile and sets the `vertexColors` property of the material to `THREE.NoColor`, meaning that the tile color will be determined by only the material color.

### `updateITownsView(view, layer)` - Updates the scene

The purpose of this function is to tell the iTowns view to update the scene. It is necessary to call this function when you make changes to the color of some tiles, for example.

### `getVerticesCentroid(tile, indexArray)` - Computes the centroid of the vertices

This function computes the centroid of the given vertices. `indexArray` is the array of indexes used to specify which vertices in the tile should be considered. This array is assumed to be contiguous and sorted.

### `getMeshFromTile(tile)` - Gets the mesh component of a tile

Search for the last child of a tile in its hierarchy, which should be an object of type "Mesh". It should have a geometry.

### `getObject3DFromTile(tile)` - Gets the root component of a tile

Search for the root component of a tile in its hierarchy, which should be an object of type "Object3D". It should have a batch table.

### `getTilesInfo(layer, ti)` - Gets or update the TI

This function is either used to create a TI for the 3DTiles layer, exploring each displayed tile, or to update an existing TI by exploring the displayed tiles that have not been visited.

## 3DTilesBuildingUtils

### `getBuildingIdFromIntersection(inter)` - Gets a building ID from an intersection

This function looks for a batch ID in the interseting object of the intersection and match it with a building ID in the batch table of the tile.

### `getBuildingInfoFromBuildingId(tilesInfo, buildingId)` - Gets a building info from a building ID

This function explores a TI to find the building information related to the specified building ID.

### `colorBuilding(layer, buildingInfo, color)` - Colors a building

Sets the specified color to the building in parameter.

## Code examples

A working code example can be found with the `3DTilesDebug` extension. In this section, we are going to take pieces of code from the source files to illustrate the use of some of the utility functions.

### Get a tile under the mouse

Using the iTowns `View` object, it is possible to get objects from the mouse positions. We can for example fetch a 3DTiles tile under the mouse :

```js
let intersections = this.itownsView.pickObjectsAt(event, 5);
let tileIntersection = getFirstTileIntersection(intersections);
let tile = tileIntersection.object;
```

In the actual code, we fetch the building ID from the intersection :

```js
let intersections = this.itownsView.pickObjectsAt(event, 5);
let tileIntersection = getFirstTileIntersection(intersections);
if (!!tileIntersection) {
  let tileId = getObject3DFromTile(tileIntersection.object).tileId;
  let batchId = getBatchIdFromIntersection(tileIntersection);
  let buildingId = getBuildingIdFromIntersection(tileIntersection);
  //...
}
```

### Get and maintain a TI

In our class, we keep a TI object with the `tilesInfo` field. In the constructor, we set it to `null` and we create a function called `updateTI`, that will be triggered when clicking a button.

```js
constructor(itownsView) {
  //...
  this.layer = itownsView.getLayerById(config['3DTilesLayerID']);
  this.tilesInfo = null;
  //...
}

updateTI() {
  this.tilesInfo = getTilesInfo(this.layer, this.tilesInfo);
}
```

The first time `updateTI` runs, the `tilesInfo` parameter passed to `getTilesInfo` is null, so the function returns a brand new TI. When the function is called afterwards, it will update the TI with tiles that hasn't been added yet, preventing it to reload completely.

### Get building info and color a building

We want to color a building when we click on it. We have seen how to get its building ID, now let's see how to color it :

```js
let buildingInfo = this.tilesInfo.tiles[tileId][batchId]; //get building info
if (!!buildingInfo) {
  if (!!this.previousBuilding) {
    //un-color the previous selected building
    let tile = getTileInTileset(this.tilesInfo.tileset,
                                this.previousBuilding.tileId);
    removeTileVerticesColor(tile);
  }
  colorBuilding(this.layer, buildingInfo, this.selectedColor);
  updateITownsView(this.iTownsView, this.layer);
  this.previousBuilding = buildingInfo;
}
```

If we had previously colored another building, we want to un-color it. We do that by removing vertex colors from the tile.

We have to call the function `updateITownsView` in order to the view to be redrawn. Otherwise, the color changes won't appear in the scene.

### Create tile groups to apply materials

Let's say we want to apply different styles to different parts of a tile (like buildings). Some buildings will be drawn in red, and other will be hidden. We can do that by defining tile groups :

```js
let tile = getTileInLayer(this.layer, 6);
createTileGroupsFromBatchIDs(tile, [{
  material: {color: 0xff0000},
  batchIDs: [64, 66]
}, {
  material: {opacity: 0},
  batchIDs: [65, 67]
}]);
```

In this example, the city objects 64 and 66 from the tile 6 will be drawn in red, whereas the city objects 65 and 67 will be invisible.
