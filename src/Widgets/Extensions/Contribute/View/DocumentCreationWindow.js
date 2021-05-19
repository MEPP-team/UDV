import * as THREE from 'three';

//Widgets
import { DocumentVisualizerWindow } from "../../../DocumentVisualizer/View/DocumentVisualizerWindow";
import { AbstractDocumentWindow } from "../../../Documents/View/AbstractDocumentWindow";

//Components
import { Window } from "../../../../Components/GUI/js/Window";
import { PositionerWindow } from "../../../../Components/Camera/PositionerWindow";

import { ContributeService } from "../Service/ContributeService";

export class DocumentCreationWindow extends AbstractDocumentWindow {
  /**
   * Creates a new document creation window.
   * 
   * @param {ContributeService} contributeService The contribute service to
   * perform requests.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   * @param {DocumentVisualizerWindow} documentImageOrienter The document image orienter module.
   */
  constructor(contributeService, itownsView, cameraControls, documentImageOrienter) {
    super('Creation');


    /**
     * The contribute service to perform requests.
     * 
     * @type {ContributeService}
     */
    this.contributeService = contributeService;

    /**
     * The camera positioner utility tool.
     * 
     * @type {PositionerWindow}
     */
    this.positioner = new PositionerWindow(itownsView, cameraControls);
    this.positioner.addEventListener(PositionerWindow.EVENT_POSITION_SUBMITTED,
      (data) => this._registerPositionAndQuaternion(data));
    this.addEventListener(Window.EVENT_DISABLED,
      () => this.positioner.disable());

    /**
     * The camera controls
     * 
     * @type {*}
     */
    this.controls = cameraControls;

    /**
     * The registered camera position for the document visualization.
     * 
     * @type {THREE.Vector3}
     */
    this.cameraPosition = undefined;

    /**
     * The registered camera orientation for the document visualization.
     * 
     * @type {THREE.Quaternion}
     */
    this.cameraQuaternion = undefined;

    /**
     * The document image orienter module.
     * 
     * @type {DocumentVisualizerWindow}
     */
    this.documentImageOrienter = documentImageOrienter;
    // Listeners to close both the positioner and the image orienter at the
    // same time.
    this.documentImageOrienter.addEventListener(Window.EVENT_DISABLED, () => {
      if (this.positioner.isVisible) {
        this.positioner.disable()
      }});
    this.positioner.addEventListener(Window.EVENT_DISABLED, () => {
      this._exitEditMode();
      if (this.documentImageOrienter.isVisible) {
        this.documentImageOrienter.disable()
      }});

    /**
     * The settings for an accurate movement of the camera. These settings
     * should be used in the `PlanarControls` class.
     * 
     * @type {{rotateSpeed: number, zoomInFactor: number, zoomOutFactor: number,
     * maxPanSpeed: number, minPanSpeed: number}}
     */
    this.accurateControlsSettings = {
      rotateSpeed: 1.5,
      zoomInFactor: 0.04,
      zoomOutFactor: 0.04,
      maxPanSpeed: 5.0,
      minPanSpeed: 0.01
    };

    /**
     * The saved state of the planar controls settings. This is used to restore
     * the default settings when needed.
     * 
     * @type {{rotateSpeed: number, zoomInFactor: number, zoomOutFactor: number,
      * maxPanSpeed: number, minPanSpeed: number}}
      */
    this.savedControlsSettings = {};
    for (let key of Object.keys(this.accurateControlsSettings)) {
      this.savedControlsSettings[key] = this.controls[key];
    }
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">Document data</h3>
        <form id="${this.formId}" class="doc-update-creation-form">
          <label for="${this.docImageId}">File</label>
          <input name="file" type="file" id="${this.docImageId}">
          <label for="${this.docTitleId}">Title</label>
          <input name="title" type="text" id="${this.docTitleId}">
          <label for="${this.descriptionId}">Description</label>
          <textarea name="description" id="${this.descriptionId}"></textarea>
          <label for="${this.pubDateId}">Publication date</label>
          <input name="publicationDate" type="date" id="${this.pubDateId}">
          <label for="${this.refDateId}">Refering date</label>
          <input name="refDate" type="date" id="${this.refDateId}">
          <label for="${this.sourceId}">Source</label>
          <input name="source" type="text" id="${this.sourceId}">
          <label for="${this.docRightsHolderId}">Rights holder</label>
          <input name="rightsHolder" type="text" id="${this.docRightsHolderId}">
          <hr>
          <button type="button" id="${this.buttonPositionId}">Set position</button>
          <input type="submit" disabled value="Create" id="${this.buttonCreateId}">
        </form>
      </div>
    `;
  }

  windowCreated() {
    this.hide();

    let reference = this.view.inspectorWindow.window.style;
    this.window.style.top = reference.top;
    this.window.style.right = reference.right;
    this.window.style.left = reference.left;
    this.window.style.width = reference.width;

    this.formElement.onsubmit = () => {
      this._submitCreation();
      return false;
    };

    this.formElement.oninput = () => this._updateFormButtons();

    this.buttonPositionElement.onclick = () => this._startPositioningDocument();

    this._initForm();
  }

  documentWindowReady() {
    this.view.navigatorWindow.addExtension('Create', {
      type: 'button',
      html: 'Create a new document',
      callback: () => this.view.requestWindowDisplay(this, true)
    });
  }

  /////////////////////////
  ///// DOCUMENT POSITIONER

  /**
   * Displays the document positioning interfaces : the window positioner and
   * the document image orienter.
   * 
   * @private
   */
  _startPositioningDocument() {
    this.positioner.appendTo(this.parentElement);
    this.positioner.window.style.left = '10px';
    this.positioner.window.style.top = '10px';

    this._enterEditMode();

    let fileReader = new FileReader();
    fileReader.onload = () => {
      this.documentImageOrienter.setImageSrc(fileReader.result);
      this.view.requestWindowDisplay(this.documentImageOrienter, false);
    };
    fileReader.readAsDataURL(this.docImageElement.files[0]);
  }

  /**
   * Change the controls settings to 'edit mode', ie. the camera moves, zooms
   * and rotates slower. This allows the user to place a document with more
   * accuracy.
   */
  _enterEditMode() {
    for (let [key, val] of Object.entries(this.accurateControlsSettings)) {
      this.controls[key] = val;
    }
  }

  /**
   * Resets the controls settings to their default value.
   */
  _exitEditMode() {
    for (let [key, val] of Object.entries(this.savedControlsSettings)) {
      this.controls[key] = val;
    }
  }

  //////////
  ///// FORM

  /**
   * Sets the initial values for the form.
   * 
   * @private
   */
  _initForm() {
    this.docImageElement.value = '';
    this.docTitleElement.value = '';
    this.sourceElement.value = '';
    this.docRightsHolderElement.value = '';
    this.descriptionElement.value = '';
    this.pubDateElement.value = '';
    this.refDateElement.value = '';
    this._updateFormButtons();
  }

  /**
   * Checks if the form is ready to be validated. Every entry must have a
   * non-empty value, and the camera position / orientation must have been set.
   * 
   * @private
   */
  _formValidation() {
    let data = new FormData(this.formElement);
    for (let entry of data.entries()) {
      if (!entry[1] || entry[1] === "") {
        return false;
      }
    }
    if (!this.cameraPosition || !this.cameraQuaternion) {
      return false;
    }
    return true;
  }

  /**
   * Update the form buttons depending on the current form state. If the
   * document have been chosen, we can position it. If the form is valid,
   * we can create the document.
   * 
   * @private
   */
  _updateFormButtons() {
    if (!!this.docImageElement.value) {
      this.buttonPositionElement.disabled = false;
    } else {
      this.buttonPositionElement.disabled = true;
    }

    if (this._formValidation()) {
      this.buttonCreateElement.disabled = false;
    } else {
      this.buttonCreateElement.disabled = true;
    }
  }

  /**
   * Registers the camera position and orientation.
   * 
   * @param {{
   *  position: THREE.Vector3,
   * quaternion: THREE.Quaternion
   * }} cameraState Position and orientation of the camera. 
   */
  _registerPositionAndQuaternion(cameraState) {
    this.cameraPosition = cameraState.position;
    this.cameraQuaternion = cameraState.quaternion;
    this._updateFormButtons();
  }

  /**
   * Proceeds to create the document from the form data.
   * 
   * @private
   */
  async _submitCreation() {
    if (!this._formValidation()) {
      return;
    }

    let data = new FormData(this.formElement);
    data.append('positionX', this.cameraPosition.x);
    data.append('positionY', this.cameraPosition.y);
    data.append('positionZ', this.cameraPosition.z);
    data.append('quaternionX', this.cameraQuaternion.x);
    data.append('quaternionY', this.cameraQuaternion.y);
    data.append('quaternionZ', this.cameraQuaternion.z);
    data.append('quaternionW', this.cameraQuaternion.w);
    
    try {
      await this.contributeService.createDocument(data);
      this.disable();
    } catch (e) {
      alert(e);
    }
  }

  /////////////
  ///// GETTERS

  get buttonPositionId() {
    return `${this.windowId}_button_position`;
  }

  get buttonPositionElement() {
    return document.getElementById(this.buttonPositionId);
  }

  get buttonCreateId() {
    return `${this.windowId}_button_creation`;
  }

  get buttonCreateElement() {
    return document.getElementById(this.buttonCreateId);
  }

  get formId() {
    return `${this.windowId}_form`;
  }

  get formElement() {
    return document.getElementById(this.formId);
  }

  get docTitleId() {
    return `${this.windowId}_title`;
  }

  get docTitleElement() {
    return document.getElementById(this.docTitleId);
  }
  
  get docImageId() {
    return `${this.windowId}_image`;
  }
  
  get docImageElement() {
    return document.getElementById(this.docImageId);
  }

  get sourceId() {
    return `${this.windowId}_source`;
  }

  get sourceElement() {
    return document.getElementById(this.sourceId);
  }

  get docRightsHolderId() {
    return `${this.windowId}_rights_holder`
  }

  get docRightsHolderElement() {
    return document.getElementById(this.docRightsHolderId);
  }

  get descriptionId() {
    return `${this.windowId}_description`;
  }

  get descriptionElement() {
    return document.getElementById(this.descriptionId);
  }

  get pubDateId() {
    return `${this.windowId}_pub_date`;
  }

  get pubDateElement() {
    return document.getElementById(this.pubDateId);
  }

  get refDateId() {
    return `${this.windowId}_ref_date`;
  }

  get refDateElement() {
    return document.getElementById(this.refDateId);
  }
}