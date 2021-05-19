//Components
import { CityObject } from "../../../Components/3DTiles/Model/CityObject";

import { CityObjectFilter } from "./CityObjectFilter";

/**
 * A specialization of `CityObjectFilter` to filter the city objects from
 * their attributes. The attributes tested are `tileId`, `batchId` and the
 * `props`. By default, this filter accepts all city objects.
 */
export class AttributeFilter extends CityObjectFilter {
  /**
   * Constructs the attribute filter.
   */
  constructor() {
    super('attributes');

    /**
     * Filters the city objects according to their tile. If this attribute is
     * undefined (default), all tiles are accepted.
     */
    this.tileId = undefined;

    /**
     * Filters the city objects according to their batch ID. If this attribute
     * is undefined (default), all batch IDs are accepted.
     */
    this.batchId = undefined;

    /**
     * Filters the city objects according to their props.
     */
    this.props = {};
  }

  /**
   * Accepts city objects according to their attributes. For each attribute in
   * this filter that evaluates to `true` (ie. neither undefined, null nor an
   * empty string), equality is tested with the city object.
   * 
   * @param {CityObject} cityObject The city object to evaluate.
   * 
   * @returns {boolean} Wether the city object is acceptable.
   */
  accepts(cityObject) {
    if (!!this.tileId && cityObject.tile.tileId !== this.tileId) {
      return false;
    }

    if (!!this.batchId && cityObject.batchId !== this.batchId) {
      return false;
    }

    for (let key of Object.keys(this.props)) {
      if (!cityObject.props[key] ||
        (!!this.props[key] && this.props[key] != cityObject.props[key])) {
        return false;
      }
    }

    return true;
  }

  /**
   * If no attribute is set, returns 'All city objects'. Otherwise, returns
   * 'Attributes' with the list of the conditions.
   */
  toString() {
    let result = '';
    let attributes = [];

    if (!!this.tileId) {
      attributes.push(['tileId', this.tileId]);
    }

    if (!!this.batchId) {
      attributes.push(['batchId', this.batchId]);
    }

    for (let entry of Object.entries(this.props)) {
      if (!!entry[1]) {
        attributes.push([entry[0], entry[1]]);
      }
    }

    if (attributes.length > 0) {
      result += 'Attributes (';
      for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i];
        result += `${attribute[0]}=${attribute[1]}`;
        if (i < attributes.length - 1) {
          result += ', ';
        }
      }
      result += ')'
    } else {
      result += 'All city objects'
    }

    return result;
  }
}