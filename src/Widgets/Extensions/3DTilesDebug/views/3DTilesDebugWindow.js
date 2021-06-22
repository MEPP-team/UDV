/** @format */

const THREE = require('three');

//Components
import { Window } from '../../../../Components/GUI/js/Window';
import { CityObjectStyle } from '../../../../Components/3DTiles/Model/CityObjectStyle';
import { CityObjectID } from '../../../../Components/3DTiles/Model/CityObject';
import { TilesManager } from '../../../../Components/3DTiles/TilesManager';

export class Debug3DTilesWindow extends Window {
  /**
   * Creates the debug window.
   *
   * @param {layer} layerManager The tiles manager.
   */
  constructor(layerManager) {
    super('3d_tiles_debug', '3DTiles Debug', false);

    /**
     * The tiles manager.
     *
     * @type {layerManager}
     */
    this.layerManager = layerManager;
    // Selection
    this.layerManager.registerStyle(
      'selected',
      new CityObjectStyle({
        materialProps: { color: 0x00ff00 },
      })
    );
    this.selectedCityObject = undefined;
    this.selectedTilesManager = undefined;

    let viewerDiv = document.getElementById('viewerDiv');
    let clickListener = (event) => {
      this.onMouseClick(event);
    };
    let moveListener = (event) => {
      this.onMouseMove(event);
    };
    this.addEventListener(Window.EVENT_ENABLED, () => {
      viewerDiv.addEventListener('mousedown', clickListener);
      viewerDiv.addEventListener('mousemove', moveListener);
    });
    this.addEventListener(Window.EVENT_DISABLED, () => {
      viewerDiv.removeEventListener('mousedown', clickListener);
      viewerDiv.removeEventListener('mousemove', moveListener);

      if (this.selectedCityObject !== undefined) {
        this.selectedTilesManager.setStyle(this.selectedCityObject.cityObjectId, this.selectedStyle);
        this.selectedTilesManager.applyStyles();
        this.selectedCityObject = undefined;
        this.selectedTilesManager = undefined;
        this.selectedStyle = undefined;
      }
    });
  }

  get innerContentHtml() {
    return /*html*/ `
      <button id="${this.logTBIButtonId}">Log Tiles Manager</button>
      <p id="${this.TBIInfoParagraphId}">0 / ? tiles loaded.</p>
      <p id="${this.visibleTilesParagraphId}">0 tiles visible.</p>
      <h3>Selected building</h3>
      <div id="${this.clickDivId}">
        No building.
      </div>
      <h3>Style</h3>
      <div>
        <form id="${this.groupColorFormId}">
          <label for="${this.groupColorTileInputId}">Tile ID</label><br>
          <input id="${this.groupColorTileInputId}" type="text"><br>
          <label for="${this.groupColorBatchInputId}">Batch IDs
            (separated by comas)</label><br>
          <input id="${this.groupColorBatchInputId}" type="text"><br>
          <label for="${this.groupColorColorInputId}">Color</label><br>
          <input id="${this.groupColorColorInputId}" type="color"><br>
          <label for="${this.groupColorOpacityInputId}">Opacity :
            <span id="${this.groupColorOpacitySpanId}">1</span></label><br>
          <input type="range" min="0" max="1" value="1" step="0.01"
            id="${this.groupColorOpacityInputId}"><br>
          <input type="submit" value="Apply style">
        </form>
      </div>
      <h3>About this tool</h3>
      <div>
        This debug window uses the 3DTilesUtils methods. Use it to find
        information about buildings and city objects.<br>
        See the <a href="../docs/3DTilesDebug.md">documentation
        of the tool</a> and the <a href="../../../Utils/3DTiles/3DTilesUtils.md">documentation about utility
        functions for 3DTiles and buildings</a>.
      </div>
    `;
  }

  windowCreated() {
    this.window.style.width = '300px';
    this.logTBIButtonElement.onclick = () => {
      this.logTilesManager();
    };
    // Sets the number of loaded tiles and add an event for dynamic change of this value.
    this.updateTBIInfoParagraphElement();
    for (let i = 0; i < this.layerManager.tilesManagers.length; i++) {
      this.layerManager.tilesManagers[i].addEventListener(
        TilesManager.EVENT_TILE_LOADED,
        (tile) => this.updateTBIInfoParagraphElement(tile)
      );
    }
    this.groupColorOpacityInputElement.oninput = () => {
      this.groupColorOpacitySpanElement.innerText =
        this.groupColorOpacityInputElement.value;
    };
    this.groupColorFormElement.onsubmit = () => {
      this.submitStyleForm();
      return false;
    };
  }

  /**
   * Updates the number of loaded 3D Tiles tiles.
   */
  updateTBIInfoParagraphElement() {
    this.TBIInfoParagraphElement.innerText = `${this.layerManager.getLoaded3DTilesTileCount()} / ${this.layerManager.getTotal3DTilesTileCount()} tiles loaded. (first tile is the root tile which has no geometry)`;
  }

  /**
   * Logs the TBI in the console.
   */
  logTilesManager() {
    console.log(this.layerManager);
  }

  /**
   * If the user is currently hovering a building, fetches the building ID and
   * displays it in the window.
   * @param {MouseEvent} event The mouse event.
   */
  onMouseMove(event) {
    // Update the current visible tile count
    let visibleTileCount =
      this.layerManager.getVisible3DTilesTileCountFromLayers();
    this.visibleTilesParagraphElement.innerText = `${visibleTileCount} tiles visible.`;
  }

  /**
   * If the user is currently hovering a building, fetches the building info
   * and colors the building. If a building was already selected, it returns to
   * its original coloring.
   *
   * @param {MouseEvent} event The mouse event.
   */
  onMouseClick(event) {
    let cityObject = this.layerManager.pickCityObject(event);

    if (cityObject !== undefined) {
      if(cityObject != this.selectedCityObject){
        for (let [key, value] of Object.entries(cityObject.props)) {
          this.clickDivElement.innerHTML += `<br>${key} : ${value}`;
        }

        if (this.selectedCityObject) {
          this.selectedTilesManager.setStyle(this.selectedCityObject.cityObjectId, this.selectedStyle);
          this.selectedTilesManager.applyStyles();
        }

        this.selectedCityObject = cityObject;
        this.selectedTilesManager = this.layerManager.getTilesManagerByLayerID(this.selectedCityObject.tile.layer.id);
        this.selectedStyle = this.selectedTilesManager.styleManager.getStyleIdentifierAppliedTo(this.selectedCityObject.cityObjectId);
        this.selectedTilesManager.setStyle(this.selectedCityObject.cityObjectId, 'selected');
        this.selectedTilesManager.applyStyles({
          updateFunction: this.selectedTilesManager.view.notifyChange.bind(
            this.selectedTilesManager.view
          ),
        });

        this.clickDivElement.innerHTML = /*html*/`
           3D Tiles : ${this.selectedTilesManager.layer.name}<br>
           Vertex indexes : ${cityObject.indexStart} to ${cityObject.indexEnd}
            (${cityObject.indexCount})<br>
           Batch ID : ${cityObject.batchId}<br>
           Tile ID : ${cityObject.tile.tileId}
         `;
      }
    }
  }

  /**
   * Creates the new style.
   */
  submitStyleForm() {
    try {
      let tileId = Number.parseInt(this.groupColorTileInputElement.value);
      let batchIds = JSON.parse(
        '[' + this.groupColorBatchInputElement.value + ']'
      );
      let color = new THREE.Color(this.groupColorColorInputElement.value);
      let opacity = Number.parseFloat(this.groupColorOpacityInputElement.value);
      this.layerManager.tilesManagers[0].setStyle(
        new CityObjectID(tileId, batchIds),
        { materialProps: { color, opacity } }
      );
      this.layerManager.tilesManagers[0].applyStyles();
    } catch (e) {
      alert(e);
    }
  }

  ////// GETTERS

  get clickDivId() {
    return `${this.windowId}_click_info`;
  }

  get clickDivElement() {
    return document.getElementById(this.clickDivId);
  }

  get logTBIButtonId() {
    return `${this.windowId}_log_button`;
  }

  get logTBIButtonElement() {
    return document.getElementById(this.logTBIButtonId);
  }

  get TBIInfoParagraphId() {
    return `${this.windowId}_tbi_p`;
  }

  get TBIInfoParagraphElement() {
    return document.getElementById(this.TBIInfoParagraphId);
  }

  get visibleTilesParagraphId() {
    return `${this.windowId}_visible_tiles_p`;
  }

  get visibleTilesParagraphElement() {
    return document.getElementById(this.visibleTilesParagraphId);
  }

  get groupColorFormId() {
    return `${this.windowId}_form_groups`;
  }

  get groupColorFormElement() {
    return document.getElementById(this.groupColorFormId);
  }

  get groupColorTileInputId() {
    return `${this.windowId}_form_groups_tileid`;
  }

  get groupColorTileInputElement() {
    return document.getElementById(this.groupColorTileInputId);
  }

  get groupColorBatchInputId() {
    return `${this.windowId}_form_groups_batchid`;
  }

  get groupColorBatchInputElement() {
    return document.getElementById(this.groupColorBatchInputId);
  }

  get groupColorColorInputId() {
    return `${this.windowId}_form_groups_color`;
  }

  get groupColorColorInputElement() {
    return document.getElementById(this.groupColorColorInputId);
  }

  get groupColorOpacityInputId() {
    return `${this.windowId}_form_groups_opacity`;
  }

  get groupColorOpacityInputElement() {
    return document.getElementById(this.groupColorOpacityInputId);
  }

  get groupColorOpacitySpanId() {
    return `${this.windowId}_form_groups_opacity_span`;
  }

  get groupColorOpacitySpanElement() {
    return document.getElementById(this.groupColorOpacitySpanId);
  }
}
