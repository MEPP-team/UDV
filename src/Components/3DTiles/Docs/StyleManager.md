# Style Manager

The `StyleManager` object serves as an interface to store and apply styles for city objects.

## Summary

1. [Usage](#Usage)
2. [Processes and data structures](#Processes-and-data-structures)
    1. [Storage of styles](#Storage-of-styles)
    2. [Reverse storage for finding usage](#Reverse-storage-for-finding-usage)
    3. [Applying styles](#Applying-styles)
        1. [Optimization: buffering the materials](#Optimization-buffering-the-materials)
3. [Detailed documentation](#Detailed-documentation)
    1. [Properties](#Properties)
    2. [Methods](#Methods)
      3. [Public](#Public)
      4. [Private](#Private)

## Usage

The style manager has two major abilities :

1. Store style data related to city objects. This mean keeping the styles to apply in a data structure that is independant from the 3DTiles objects, avoiding to lose the data if a tile unloads.
2. Modify the 3DTiles layer to apply the stored styles.

To store styles, the `StyleManager` provide a single function, called `setStyle`. Let's look at its signature :

```js
setStyle(cityObjectId, style)
```

The first parameter is a `CityObjectID` object, that identifies one or many city objects in a tile. The second parameter is either a `CityObjectStyle` or a string referring to a registered style (We'll cover registered styles later in this document). The purpose of this method is to update the data structures of the `StyleManager`, so that the style passed in parameter becomes the style associated with the city objects identified by the first parameter.

Let's see some example code :

```js
// The constructor takes no argument
let sm = new StyleManager();

// The city object 64 in the tile 6 will have a red material
sm.setStyle(new CityObjectID(6, 64), new CityObjectStyle({materialProps: {color: 0xff0000}});
```

After this code, the style manager has been updated and knows that the city object (6; 64) should have a red material. Note that this code does not update the actual city object in the 3DTiles layer, it just tells the `StyleManager` what this city object should look like.

In this example, we've use an _anonymous style_ for our city object. However, there is another way of using the `setStyle` method :

```js
// Register a style, that we call "red"
sm.registerStyle('red', new CityObjectStyle({materialProps: {color: 0xff0000}});

// The city object 66 in the tile 6 will use the material registered under the name 'red'
sm.setStyle(new CityObjectID(6, 66), 'red');
```

The advantage of this method is that the registered style is re-usable : you can call the `setStyle` function on other city objects with the style 'red' and they will have the same style. To learn about the differences between _anonymous styles_ and _registered styles_, please refer to the [storage of styles](#Storage-of-styles) section.

Now that we've told our style manager how our city objects should look like, we should tell it to actually modify the 3DTiles layer. To to that, the other method you should know is the following :

```js
applyToTile(tile)
```

Its only argument is a `Tile` objects that must be loaded (ie. its `isLoaded()` method should return `true`). The style manager will search if any style has been associated with city objects that belongs to this style. If this is the case, it will modify the 3DTiles layer to correspond to the associated style.

```js
// Create the object corresponding to the 6th tile
let tile = new Tile(view.getLayerById('3dtiles-layer'), 6);
tile.loadCityObjects();

// Now update the tile so that it has the style we defined with `setStyle`
sm.applyToTile(tile);
```

It is also possible to remove styles from objects. To do that, three different methods exist depending on what exaclty you want to remove :

```js
// Remove a style associated with specific city objects
sm.removeStyle(new CityObjectID(6, 64));

// Remove styles associated with all city objects in a specific tile
sm.removeStyleFromTile(6)

// Resets the `StyleManager`. Please note that registered styles will persist
sm.removeAllStyles();

// Remove all styles that exist. Before actually removing the styles, we store
// the styles that had at least one style applied to them.
let tilesToUpdate = sm.getStyledTiles();
sm.applyToTile()

// Apply the changes on these tiles
for (let tileId of tilesToUpdate) {
    sm.applyToTile(tileId);
}
```

## Processes and data structures

### Storage of styles

In a `StyleManager`, a style can be either _anonymous_ or _registered_ (also called _named_). A named style is a style that was first associated with a name by using the `registerStyle` method. On the other hand, an anonymous style is a `CityObjectStyle` that has been passed directly as the second parameter of the `setStyle` method :

```js
// Named style
styleManager.registerStyle('red', new CityObjectStyle({materialProps: {color: 0xff0000}}));
styleManager.setStyle(new CityObjectID(6, 64), 'red');

// Anonymous style
styleManager.setStyle(new CityObjectID(6, 64), new CityObjectStyle({materialProps: {color: 0xff0000}}));
```

The `StyleManager` uses two types of storage for these styles. The named styles are kept in a dictionnary called `registeredStyles` where the keys are the names of the styles, and the values the styles themselves. The anonymous styles are stored in an array called `anonymousStyles`.

Using two different structures allows the style manager to use a generic identifier to reference the stored styles. If a string is used as an identifier, we know that it references a named style, whereas if a number is used, we know that it represents an index in the anonymous styles array.

The structure used to associated city objects with their respective style is a field called `styleTable`. The style table is a dictionnary where the key is a tile ID, and the value is another dictionnary that associates batch IDs of the tile to style identifiers. Style identifiers, as said before, are strings or numbers depending on wether they refer to anonymous or named styles.

There are a few things to know about anonymous and named styles when using them :

- When using an anonymous style in the `setStyle` method, the `StyleManager` will parse the `anonymousStyles` array to determine wether a similar style has already been registered. This is done by calling the `equals` method of `CityObjectStyle`. If an equivalent anonymous style is found, the style identifier associated to the city object will be the index of the matching style. Otherwise, the style will be pushed into the anonymous array and its new index will be used as a style identifier.
- When registering a style with the `registerStyle` method, two cases can happen : either a style with the same name already exist or not. If the style was already registered, it is simply updated with the new values. This means that the city objects associated with this name will be applied the new style.
- When adding a named style in the `registeredStyles` structure, the `StyleManager` does not check if a style with the same properties already exist. This mean you can have duplicate named style.

Some methods of `StyleManager` allow to access styles :

- `getStyle(styleIdentifier)` returns a style identified by the argument. It can either be a string or a number, depending on the style being _named_ or _anonymous_.
- `getStyleAppliedTo(cityObjectId)` returns the style associated to the city object in argument.

### Reverse storage for finding usage

The `StyleManager` also allows its user to access city objects associated with specific styles. This is the role of the `getStyleUsage(styleIdentifier)` function : by passing a style identifier (can be theorically a string or a number, however the user does not have access to anonymous style indexes so the main use case will be with registered styles), this function returns a dictionnary that maps tile IDs to arrays of batch IDs. This structure represents all city objects that have the given style.

To do that efficiently, the `StyleManger` stores two structures, respectively called `registeredStyleUsage` and `anonymousStyleUsage`. They work the same way : 

### Applying styles

#### Optimization: buffering the materials

## Detailed documentation

### Properties

### Methods

#### Public

#### Private
