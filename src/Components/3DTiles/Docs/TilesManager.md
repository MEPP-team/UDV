# Tiles Manager

The `TilesManager` object serves as an interface to manage 3DTiles tiles and city objects.

## Summary

1. [Usage](#Usage)
2. [Processes and data structures](#Processes-and-data-structures)
    1. [Tiles and city objects representation](#Tiles-and-city-objects-representation)
    2. [Style and tile updates](#Style-and-tile-updates)
3. [Detailed documentation](#Detailed-documentation)
    1. [Properties](#Properties)
    2. [Methods](#Methods)
      3. [Public](#Public)
      4. [Private](#Private)

## Usage

The `TilesManager` object is used to perform some operations on the 3DTiles layer and the city objects. These operations are :

1. Analyze the layer structure to extract data specific to city objects and tiles, such as the batch IDs and properties from the batch table.
2. Retrieve information about a city object.
3. Change the style of tiles and city objects.

The first step is to initialize a `TilesManager` and to update its data about tiles and city objects. Here is an example code that does this job :

```js
// The constructors takes the iTowns view object, and the layer that contains 3DTiles data
let tm = new TilesManager(view, view.getLayerById('3dtiles-layer'));

// Update will analyze the tile structure of the layer
tm.update();
```

After the call of `update`, the intern representation of tiles and city objects will contains data about the tiles currently visible on screen. You can verify this by examining a specific city object :

```js
let cityObject = tm.getCityObject(new CityObjectID(6, 64));
```

If the tile 6 was visible on screen when the `update` method was called, `cityObject` will be a valid `CityObject` instance with valid properties. Otherwise, you would have to call again `update` when the corresponding tile is loaded by iTowns. A good practice is to call the `update` method whenever you need to access city objects, so that your tiles manager is always up-to-date when needed.

> In the future, the `update` function shall be removed and replaced by listeners to 3DTiles events, shuch as tile loading. However, as these events are not implemented yet, we have to do the update manually.

If the corresponding tile has been loaded by the tiles manager, you are also able to use the mouse cursor of the user to retrieve city objects : 

```js
window.addEventListener('mousedown', (event) => {
  // Make sure the visible tiles are loaded
  tm.udpate();
  // `event` should be a MouseEvent
  let cityObject = tm.pickCityObject(event);

  if (cityObject !== undefined) {
    // Do stuff...
  } else {
    // Either no city object is located under the mouse cursor
  }
});
```

The last purpose of the `TilesManager` is to handle the style of city objects. This is done by using a `StyleManager`, so if you want to know more about it, please check out [the corresponding documentation](./StyleManager.md). `TilesManager` exposes some methods of the `StyleManager` and add some intern logic to keep track of the tiles that need to be updated :

```js
// Set anonymous styles
tm.setStyle({tileId: 6, batchId: 64}, {materialProps: {color: 0xff0000}});
// Register and assign named styles
tm.registerStyle('red', {materialProps: {color: 0xff0000}});
tm.setStyle({tileId: 6, batchId: [66, 67]}, 'red');

// Remove styles (from city objects, tiles or the whole layer)
tm.removeStyle({tileId: 6, batchId: 64});
tm.removeStyleFromTile(6);
tm.removeAllStyles();

// Apply style to a tile
tm.applyStyleToTile(6);
// Apply style to all tiles that need to be updated
tm.applyStyles();

```

## Processes and data structures

### Tiles and city objects representation

### Style and tile updates

## Detailed documentation

### Properties

### Methods

#### Public

#### Private
