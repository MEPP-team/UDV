//Components
import { Window } from "../../../Components/GUI/js/Window";
import { LayerManager } from "../../../Components/LayerManager/LayerManager";

export class LayerChoice extends Window {
  /**
   * Creates the layer choice windows 
   * 
   * @param {LayerManager} layerManager 
   */
  constructor(layerManager) {
    super('layer_choice', 'Layer', false);

    /** 
     * the layerManager
     */
    this.layerManager = layerManager;
  }

  get innerContentHtml() {
    return /*html*/`
    <ul id="${this.layerListId}">
    </ul>
    <div class ="box-section"> 
    <input type="checkbox" class="spoiler-check" id="color-layers-spoiler">
    <label for="color-layers-spoiler" class="section-title">Color Layers</Label>
      <div class="spoiler-box">
        <ul id= "${this.colorLayersId}">
        </ul>
      </div>
    </div>
    <div class ="box-section"> 
    <input type="checkbox" class="spoiler-check" id="elevation-layers-spoiler">
    <label for="elevation-layers-spoiler" class="section-title">Elevation Layers</Label>
      <div class="spoiler-box">
        <ul id= "${this.elevationLayersId}">
        </ul>
      </div>
    </div>
    <div class ="box-section"> 
      <input type="checkbox" class="spoiler-check" id="geometry-layers-spoiler">
      <label for="geometry-layers-spoiler" class="section-title">Geometry Layers</Label>
      <div class="spoiler-box">
        <ul id= "${this.geometryLayersId}">
        </ul>
      </div>
    </div>
    `;
  }

  windowCreated() {
    this.innerContentColorLayers();
    this.innerContentElevationLayers();
    this.innerContentGeometryLayers();
  }

  // Create the description part of ColorLayers
  innerContentColorLayers() {
    let list = this.colorLayerListElement;
    list.innerHTML = '';
    let layers = this.layerManager.getColorLayers();
    for (let i = 0; i < layers.length; i++) {
      let item = document.createElement('div');
      item.innerHTML = `<label for="${layers[i].id}-spoiler" class="section-title">${layers[i].id}</Label>
                        Visible <input type="checkbox" id="checkbox_${i}" ${layers[i].visible ? "checked" : ""}></input></br>
                        <div id="opacity_${i}"> 
                          Opacity : <span id="color_value_opacity_${i}">${layers[i].opacity}</span>  <input type ="range" id="range_${i}" min="0" max="1" step = "0.1" value="${layers[i].opacity}"></input>
                        </div>`;

      item.oninput = (event) => {
        if (event.srcElement.id === "checkbox_" + i) {
          layers[i].visible = event.srcElement.checked;
        }
        if (event.srcElement.id === "range_" + i) {
          this.layerManager.updateOpacity(layers[i], event.srcElement.valueAsNumber);
        }
        let span_opacity = document.getElementById("color_value_opacity_" + i);
        span_opacity.innerHTML = `${layers[i].opacity}`;
        this.layerManager.notifyChange();
      };
      list.appendChild(item);
    }
  }

  // Create the description part of ElevationLayers
  innerContentElevationLayers() {
    let list = this.elevationLayerListElement;
    list.innerHTML = '';
    let layers = this.layerManager.getElevationLayers();
    for (let i = 0; i < layers.length; i++) {
      let item = document.createElement('div');
      item.innerHTML = `<h3>${layers[i].id}</h3>
                        Scale : <span id="elevation_value_scale_${i}">${layers[i].scale}</span> <input type ="range" id="${i}" min="1" max="10" step = "1" value="${layers[i].scale}"></input>`;

      item.oninput = (event) => {
        this.layerManager.updateScale(layers[i], event.srcElement.valueAsNumber);
        this.layerManager.notifyChange();
        let span_elevation = document.getElementById("elevation_value_scale_" + i);
        span_elevation.innerHTML = `${layers[i].scale}`;
      };
      list.appendChild(item);
    }
  }

  // Create the description part of GeometryLayers
  innerContentGeometryLayers() {
    let list = this.geometryLayerListElement;
    list.innerHTML = '';
    let layers = this.layerManager.getGeometryLayers();

    let div = document.createElement('div');
    div.innerHTML = `
      All Visible <input type="checkbox" id="checkbox" ${this.layerManager.isOneLayerVisible() ? "checked" : ""}></input></br>
  `;
    div.onchange = (event) => {
      this.layerManager.changeVisibility(event.srcElement.checked);
      this.layerManager.notifyChange();
    };
    list.append(div);
    for (let i = 0; i < layers.length; i++) {
      let item = document.createElement('div');
      item.innerHTML = `<input type="checkbox" class="spoiler-check" id="${layers[i].id}-spoiler">
                        <label for="${layers[i].id}-spoiler" class="subsection-title">${layers[i].id}</Label>
                        <div class="spoiler-box">
                          <div id="visible_${i}">
                          Visible <input type="checkbox" id="checkbox_${i}" ${layers[i].visible ? "checked" : ""}></input></br>
                          </div>
                          <div id="opacity_${i}"> 
                            Opacity : <span id="geometry_value_opacity_${i}">${layers[i].opacity}</span><input type ="range" id="range_${i}" min="0" max="1" step = "0.1" value="${layers[i].opacity}"></input>
                          </div>
                        </div>`;

      item.oninput = (event) => {
        if (event.srcElement.id === "checkbox_" + i) {
          layers[i].visible = event.srcElement.checked;
        }
        if (event.srcElement.id === "range_" + i) {
          this.layerManager.updateOpacity(layers[i], event.srcElement.valueAsNumber);
        }
        let div_visible = document.getElementById("visible_" + i);
        div_visible.innerHTML = `Visible <input type="checkbox" id="checkbox_${i}" ${layers[i].visible ? "checked" : ""}></input></br>`;
        let span_opacity = document.getElementById("geometry_value_opacity_" + i);
        span_opacity.innerHTML = `${layers[i].opacity}`;
        this.layerManager.notifyChange();
      };
      list.appendChild(item);
    }
  }
  ////// GETTERS

  get colorLayersId() {
    return `${this.windowId}_color_layers`;
  }

  get elevationLayersId() {
    return `${this.windowId}_elevation_layers`;
  }

  get geometryLayersId() {
    return `${this.windowId}_geometry_layers`;
  }

  get layerListId() {
    return `${this.windowId}_layer_list`;
  }

  get layerListElement() {
    return document.getElementById(this.layerListId);
  }

  get colorLayerListElement() {
    return document.getElementById(this.colorLayersId);
  }

  get elevationLayerListElement() {
    return document.getElementById(this.elevationLayersId);
  }

  get geometryLayerListElement() {
    return document.getElementById(this.geometryLayersId);
  }
}