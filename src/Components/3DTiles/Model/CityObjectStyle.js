import * as THREE from "three";

/**
 * Represents the style of a tile part. Accepted parameters are :
 * 
 * - `materialProps` : properties of a THREE.js material.
 */
export class CityObjectStyle {
  constructor(params) {
    /**
     * THREE.js material properties.
     * 
     * @member {any} 
     */
    this.materialProps = null;

    if (typeof(params) !== "object") {
      throw 'TilePartStyle require parameters in its constructor';
    }

    for (let key of Object.keys(params)) {
      if (this[key] === null) {
        this[key] = params[key];
      } else {
        console.warn(`Invalid parameter for TilePartStyle : ${key}`);
      }
    }

    // Uniform color representation accros styles
    if (this.materialProps !== undefined
      && this.materialProps.color !== undefined) {
      this.materialProps.color = new THREE.Color(this.materialProps.color);//TODO clean this, a ref dont change its type
    }
  }

  /**
   * Checks if this style is equivalent to another style.
   * 
   * @param {CityObjectStyle} otherStyle Another style.
   */
  equals(otherStyle) {
    if (!(otherStyle instanceof CityObjectStyle)) {
      return false;
    }

    if (otherStyle === this) {
      return true;
    }

    return this.materialPropsEquals(otherStyle.materialProps);
  }

  /**
   * Checks if the material properties of this object are equivalent to the ones
   * in parameter.
   * 
   * @param {any} otherProps Another material properties object.
   */
  materialPropsEquals(otherProps) {
    if (this.materialProps === otherProps) {
      // Same reference
      return true;
    }

    for (let thisKey of Object.keys(this.materialProps)) {
      if (thisKey === 'transparent') {
        // Ignore the transparent value
        continue;
      }

      let otherValue = otherProps[thisKey];

      if (otherValue === undefined) {
        // We have a prop the other don't
        return false;
      }

      let thisValue = this.materialProps[thisKey];

      if (thisKey === 'color' && otherValue.getHex() === thisValue.getHex()) {
        // To compare color, use the hex representation
        continue;
      }

      if (thisValue !== otherValue) {
        // Generic case : values don't match
        return false;
      }
    }

    for (let otherKey of Object.keys(otherProps)) {
      if (otherKey === 'transparent') {
        // Again, ignore it
        continue;
      }

      if (this.materialProps[otherKey] === undefined) {
        // They have a prop we don't
        return false;
      }
    }

    return true;
  }
}