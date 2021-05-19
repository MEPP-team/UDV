import { CityObjectFilterSelector } from "./CityObjectFilterSelector";
import { CityObjectProvider } from "../ViewModel/CityObjectProvider";
import { AttributeFilter } from "../ViewModel/AttributeFilter";

/**
 * A filter selector for the `AttributeFilter` filter. It allows the user to
 * select it in the filter window, and specify some parameters (such as the
 * tile ID and the batch ID). It also serves as an example of implementation
 * for the `FilterSelector` class.
 */
export class AttributeFilterSelector extends CityObjectFilterSelector {
  /**
   * Constructs the attribute filter selector from the provider.
   * 
   * @param {CityObjectProvider} provider The city object provider.
   */
  constructor(provider) {
    super('attributes', 'City object attributes');

    /**
     * The associated attribute filter.
     * 
     * @type {AttributeFilter}
     */
    this.filter = new AttributeFilter();

    // Adds the filter in the filter list of the provider
    provider.addFilter(this.filter);
  }

  get html() {
    return /*html*/`
      <label for="tileId">Tile ID</label>
      <input type="text" name="tileId">
      <label for="batchId">Batch ID</label>
      <input type="text" name="batchId">
      <label for="cityobject.database_id">cityobject.database_id</label>
      <input type="text" name="cityobject.database_id">
    `;
  }

  /**
   * Sets the `tileId`, `batchId` and `props` attributes of the attribut filter
   * from the given form data.
   * 
   * @override
   * 
   * @param {FormData} formData
   */
  onSubmit(formData) {
    this.filter.tileId = Number(formData.get('tileId'));
    this.filter.batchId = Number(formData.get('batchId'));
    for (let key of formData.keys()) {
      if (key !== 'tileId' && key !== 'batchId' && key !== 'filterLabel') {
        this.filter.props[key] = formData.get(key);
      }
    }
  }
}