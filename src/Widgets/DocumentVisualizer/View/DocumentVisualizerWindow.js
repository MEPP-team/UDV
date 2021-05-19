import { AbstractDocumentWindow } from "../../Documents/View/AbstractDocumentWindow";
import * as THREE from "three";

import './DocumentVisualizer.css';
import { DocumentProvider } from "../../Documents/ViewModel/DocumentProvider";
import { DocumentModule } from "../../Documents/DocumentModule";

/**
 * Represents the document visualizer, under the form of an oriented image. It
 * is a window without its default style, centered in the view with an opacity
 * control.
 */
export class DocumentVisualizerWindow extends AbstractDocumentWindow {
  /**
   * Creates a new document image orienter.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   */
  constructor(documentModule, itownsView, cameraControls) {
    super('Image Orienter');
    // Remove the default style of the window
    this.defaultStyle = false;
    this.windowDisplayWhenVisible = 'block';

    // Add the image orienter as a document window
    documentModule.addDocumentWindow(this);
    documentModule.addInspectorExtension('Orient', {
      type: 'button',
      container: 'left',
      html: 'Visualize',
      callback: async () => {
        this.disable();
        await this.startTravelToDisplayedDocument();
        this.requestDisplay();
      }
    });

    /**
     * The iTowns view.
     * 
     * @type {any}
     */
    this.itownsView = itownsView;

    /**
     * The camera controls.
     * 
     * @type {any}
     */
    this.cameraControls = cameraControls;

    /**
     * The visualization camera position.
     * 
     * @type {THREE.Vector3}
     */
    this.position = undefined;

    /**
     * The visualization camera orientation.
     * 
     * @type {THREE.Quaternion}
     */
    this.quaternion = undefined;
  }

  get html() {
    return /*html*/`
      <img id="${this.imageId}"/>
      <div class="controls-panel">
        <button id="${this.closeButtonId}">Close</button>
        <div class="slider-container">
          <div class="slider-label">
            <label for="${this.opacitySliderId}">Opacity : </label>
            <output for="${this.opacitySliderId}" id="${this.opacityId}">1</output>
          </div>
          <input type="range" min="0" max="1" value="1" step="0.01" id="${this.opacitySliderId}">
        </div>
      </div>
    `;
  }

  windowCreated() {
    this.hide();
    this.window.classList.add("orienter-box");
    this.window.style.position = 'absolute';

    this.closeButtonElement.onclick = () => {
      this.disable();
    };

    this.opacitySliderElement.oninput = () => {
      this._onOpacityChange();
    };
  }

  documentWindowReady() {
    // Dispose the window when the displayed document change
    this.provider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      () => this.disable());
  }

  //////////////////////
  ///// TRAVEL & OPACITY

  /**
   * Triggered when the opacity of the slider changes. This method apply the
   * change on the image and the output element.
   * 
   * @private
   */
  _onOpacityChange() {
    let opacity = this.opacitySliderElement.value;
    this.opacityElement.value = opacity;
    this.imageElement.style.opacity = opacity;
  }

  /**
   * Sets the orientation for the camera. `startTravel` should be called after
   * this method to apply the new position.
   * 
   * @param {THREE.Vector3} position The visualization camera position.
   */
  setTargetPosition(position) {
    this.position = position;
  }

  /**
   * Sets the orientation for the camera. `startTravel` should be called after
   * this method to apply the new orientation.
   * 
   * @param {THREE.Quaternion} position The visualization camera orientation.
   */
  setTargetQuaternion(quaternion) {
    this.quaternion = quaternion;
  }

  /**
   * Sets the image source.
   * 
   * @param {string} newSrc The image source.
   */
  setImageSrc(newSrc) {
    this.imageElement.src = newSrc;
  }

  /**
   * Retrieve the displayed document and start a travel to its visualization
   * location.
   * 
   * @async
   */
  async startTravelToDisplayedDocument() {
    let currentDoc = this.provider.getDisplayedDocument();

    if (!currentDoc) {
      return;
    }

    let imageSrc = await this.provider.getDisplayedDocumentImage();

    if (isNaN(currentDoc.visualization.positionX) ||
      isNaN(currentDoc.visualization.quaternionX)) {
        return;
    }

    var docViewPos = new THREE.Vector3();
    docViewPos.x = parseFloat(currentDoc.visualization.positionX);
    docViewPos.y = parseFloat(currentDoc.visualization.positionY);
    docViewPos.z = parseFloat(currentDoc.visualization.positionZ);
    this.setTargetPosition(docViewPos);

    var docViewQuat = new THREE.Quaternion();
    docViewQuat.x = parseFloat(currentDoc.visualization.quaternionX);
    docViewQuat.y = parseFloat(currentDoc.visualization.quaternionY);
    docViewQuat.z = parseFloat(currentDoc.visualization.quaternionZ);
    docViewQuat.w = parseFloat(currentDoc.visualization.quaternionW);
    this.setTargetQuaternion(docViewQuat);

    this.setImageSrc(imageSrc);

    await this.startTravel();
  }

  /**
   * Starts the document orientation. The processes first assign the correct src
   * to the image, then sets the opacity to 0. After the travel is finished,
   * the opacity is gradually restored.  
   * To call this function, the `position`, `quaternion` and `imageSrc`
   * attributes must all have been set beforehand.
   * 
   * @async
   */
  startTravel() {
    this.imageElement.style.opacity = 0;
    this.opacitySliderElement.value = 0;
    this.opacityElement.value = 0;

    this.cameraControls.initiateTravel(this.position, 2,
        this.quaternion, true);
    this.itownsView.notifyChange();

    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          let intervalHandle;
          let increaseOpacity = () => {
            let nextValue = Number(this.opacitySliderElement.value) + 0.01;
            this.opacitySliderElement.value = nextValue;
            this._onOpacityChange();
            if (nextValue >= 1) {
              nextValue = 1;
              clearInterval(intervalHandle)
            }
          };
          intervalHandle = setInterval(increaseOpacity, 15);
          resolve();
        }, 2000);
      } catch (e) {
        reject(e); 
      }
    });
  }

  /////////////
  ///// GETTERS

  get closeButtonId() {
    return `${this.windowId}_close_button`
  }

  get closeButtonElement() {
    return document.getElementById(this.closeButtonId);
  }

  get opacitySliderId() {
    return `${this.windowId}_opacity_slider`
  }

  get opacitySliderElement() {
    return document.getElementById(this.opacitySliderId);
  }
  
  get opacityId() {
    return `${this.windowId}_opacity`
  }

  get opacityElement() {
    return document.getElementById(this.opacityId);
  }

  get imageId() {
    return `${this.windowId}_image`
  }

  get imageElement() {
    return document.getElementById(this.imageId);
  }
}