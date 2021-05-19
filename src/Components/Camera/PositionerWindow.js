import { Window } from "../GUI/js/Window";
import { MAIN_LOOP_EVENTS } from 'itowns';
import * as THREE from 'three';

export class PositionerWindow extends Window {
  constructor(itownsView, cameraControls) {
    super('camera-positioner', 'Camera Positioner', false);

    this.itownsView = itownsView;
    this.cameraControls = cameraControls;

    // Request update every active frame
    this.itownsView.addFrameRequester(MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      () => this._updateFieldsFromCamera() );

    // Event for position registering
    this.registerEvent(PositionerWindow.EVENT_POSITION_SUBMITTED);
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">Coordinates</h3>
        <form id="${this.formId}">
          <fieldset>
            <legend>Position</legend>
            <label for="${this.positionXId}">X</label>
            <input id="${this.positionXId}" name="positionX" type="text"><br>
            <label for="${this.positionYId}">Y</label>
            <input id="${this.positionYId}" name="positionY" type="text"><br>
            <label for="${this.positionZId}">Z</label>
            <input id="${this.positionZId}" name="positionZ" type="text"><br>
          </fieldset>
          <fieldset>
            <legend>Quaternion</legend>
            <label for="${this.quaternionXId}">X</label>
            <input id="${this.quaternionXId}" name="quaternionX" type="text"><br>
            <label for="${this.quaternionYId}">Y</label>
            <input id="${this.quaternionYId}" name="quaternionY" type="text"><br>
            <label for="${this.quaternionZId}">Z</label>
            <input id="${this.quaternionZId}" name="quaternionZ" type="text"><br>
            <label for="${this.quaternionWId}">W</label>
            <input id="${this.quaternionWId}" name="quaternionW" type="text"><br>
          </fieldset>
          <hr>
          <button id="${this.buttonValidateId}" type="button">Validate</button>
          <input id="${this.buttonTravelId}" type="submit" value="Travel">
        </form>
      </div>
    `;
  }

  windowCreated() {
    this.window.style.width = '300px';

    this.formElement.onsubmit = () => {
      this._travel();
      return false;
    };

    this.buttonValidateElement.onclick = () => {
      this._validate();
    }
  }

  /////////////////////////
  ///// POSITION MANAGEMENT

  /**
   * Updates the form fields from the camera position.
   */
  _updateFieldsFromCamera() {
    if (this.isVisible) {
      let camera = this.itownsView.camera.camera3D;
      let position = camera.position;
      let quaternion = camera.quaternion;
      this.positionXElement.value = position.x;
      this.positionYElement.value = position.y;
      this.positionZElement.value = position.z;
      this.quaternionXElement.value = quaternion.x;
      this.quaternionYElement.value = quaternion.y;
      this.quaternionZElement.value = quaternion.z;
      this.quaternionWElement.value = quaternion.w;
    }
  }

  /**
   * Retrieve the current camera position from the form fields.
   * 
   * @returns {{position: THREE.Vector3, quaternion: THREE.Quaternion}}
   */
  _getCameraPosition() {
    let data = new FormData(this.formElement);
    let position = new THREE.Vector3();
    let quaternion = new THREE.Quaternion();

    position.x = Number(data.get('positionX'));
    position.y = Number(data.get('positionY'));
    position.z = Number(data.get('positionZ'));

    quaternion.x = Number(data.get('quaternionX'));
    quaternion.y = Number(data.get('quaternionY'));
    quaternion.z = Number(data.get('quaternionZ'));
    quaternion.w = Number(data.get('quaternionW'));

    return {
      position,
      quaternion
    };
  }

  /**
   * Make the camera travel to the position and orientation in the form fields.
   */
  async _travel() {
    let camera = this._getCameraPosition();
    this.cameraControls.initiateTravel(camera.position, 'auto', camera.quaternion,
      true);
  }
  
  /**
   * Sends the position submitted event with the current camera position and
   * orientation.
   */
  _validate() {
    let camera = this._getCameraPosition();
    this.sendEvent(PositionerWindow.EVENT_POSITION_SUBMITTED, camera);
    this.disable();
  }

  /////////////
  ///// GETTERS

  get buttonValidateId() {
    return `${this.windowId}_button_validate`;
  }

  get buttonValidateElement() {
    return document.getElementById(this.buttonValidateId);
  }

  get buttonTravelId() {
    return `${this.windowId}_button_travel`;
  }

  get buttonTravelElement() {
    return document.getElementById(this.buttonTravelId);
  }

  get formId() {
    return `${this.windowId}_form`;
  }

  get formElement() {
    return document.getElementById(this.formId);
  }

  get positionXId() {
    return `${this.windowId}_position_x`;
  }

  get positionXElement() {
    return document.getElementById(this.positionXId);
  }

  get positionYId() {
    return `${this.windowId}_position_y`;
  }

  get positionYElement() {
    return document.getElementById(this.positionYId);
  }

  get positionZId() {
    return `${this.windowId}_position_z`;
  }

  get positionZElement() {
    return document.getElementById(this.positionZId);
  }

  get quaternionXId() {
    return `${this.windowId}_quaternion_x`;
  }

  get quaternionXElement() {
    return document.getElementById(this.quaternionXId);
  }

  get quaternionYId() {
    return `${this.windowId}_quaternion_y`;
  }

  get quaternionYElement() {
    return document.getElementById(this.quaternionYId);
  }

  get quaternionZId() {
    return `${this.windowId}_quaternion_z`;
  }

  get quaternionZElement() {
    return document.getElementById(this.quaternionZId);
  }

  get quaternionWId() {
    return `${this.windowId}_quaternion_w`;
  }

  get quaternionWElement() {
    return document.getElementById(this.quaternionWId);
  }

  ////////////
  ///// EVENTS

  static get EVENT_POSITION_SUBMITTED() {
    return 'EVENT_POSITION_SUBMITTED';
  }
}