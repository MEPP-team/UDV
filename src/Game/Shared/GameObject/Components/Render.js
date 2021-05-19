/** @format */

const THREE = require('three');

const RenderModule = class Render {
  constructor(parent, json) {
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.idModel = json.idModel || null;
    this.name = json.name || null; //TODO display it above object3D

    //internal
    this.object3D = null;
    this.originalObject3D = null;
  }

  isServerSide() {
    return false;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      type: RenderModule.TYPE,
      idModel: this.idModel,
    };
  }

  computeBoundingBox() {
    return new THREE.Box3().setFromObject(this.getObject3D());
  }

  getObject3D() {
    return this.object3D;
  }

  getOriginalObject3D() {
    return this.originalObject3D;
  }

  initAssets(assetsManager) {
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'Render Object3D ' + this.parent.getName();

    //stock data in userData
    this.object3D.userData = {
      uuid: this.parent.getUUID(),
    };

    //get the 3D model
    if (this.idModel) {
      this.object3D.add(assetsManager.fetchModel(this.idModel));
    }

    //name display above model
    if (this.name) {
      const bb = this.computeBoundingBox();
      const sprite = assetsManager.buildSprite(this.name);
      const bbSprite = new THREE.Box3().setFromObject(sprite);
      sprite.position.z = bb.max.z + 0.5 * (bbSprite.max.y - bbSprite.min.y);
      this.object3D.add(sprite);
    }

    this.originalObject3D = this.object3D.clone();//keep a copy of it

    return this.object3D;
  }
};

RenderModule.TYPE = 'Render';

module.exports = RenderModule;
