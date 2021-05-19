//Components
import { CityObjectStyle } from "../../../Components/3DTiles/Model/CityObjectStyle";

import { CityObjectFilter } from "./CityObjectFilter";

/**
 * A layer represents an association between a set of city objects and a style.
 * The set of city objects is defined by a filter.
 */
export class CityObjectLayer {
  /**
   * Constructs a layer from a filter and a style.
   * 
   * @param {CityObjectFilter} filter The filter associated with the layer.
   * @param {CityObjectStyle | string} style The style associated with the
   * layer.
   */
  constructor(filter, style) {
    if (!(filter instanceof CityObjectFilter)) {
      throw 'The filter must be an instance of CityObjectFilter.';
    }

    /**
     * The filter associated with the layer.
     * 
     * @type {CityObjectFilter}
     */
    this.filter = filter;

    /**
     * The style associated with the layer.
     * 
     * @type {CityObjectStyle | string}
     */
    this.style = style;
  }
}