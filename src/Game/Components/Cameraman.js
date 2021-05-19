/** @format */

const THREE = require('three');

const CAMERA_ANGLE = Math.PI / 12;
const THIRD_PERSON_FOV = 60;

export class Cameraman {
  constructor(camera) {
    //three js camera
    this.camera = camera;

    //target
    this.target = null;
    this.bbTarget = null;
    this.filmingTarget = true;

    //updating or not
    this.enabled = true;

    //raycaster
    this.raycaster = new THREE.Raycaster();
    this.raycaster.camera = camera;

    //routines
    this.routines = [];
  }

  isFilmingTarget() {
    return this.filmingTarget;
  }

  setFilmingTarget(value) {
    this.filmingTarget = value;
  }

  getCamera() {
    return this.camera;
  }

  setTarget(gameObject) {
    if (this.target == gameObject) return; //only when its changed

    this.target = gameObject;

    if (this.target) {
      //follow tps
      this.camera.fov = THIRD_PERSON_FOV;
      const obj = this.target.fetchObject3D();
      this.bbTarget = new THREE.Box3().setFromObject(obj); //compute here one time
      this.camera.updateProjectionMatrix();
    }
  }

  focusTarget(obstacle) {
    if (!this.target) {
      console.warn('no target');
      return;
    }
    const transform = this.computeTransformTarget(obstacle);

    this.camera.position.copy(transform.position);
    this.camera.quaternion.copy(transform.quaternion);

    this.camera.updateProjectionMatrix();
  }

  computeTransformTarget(obstacle = null) {
    const quaternionCam = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.PI * 0.5, 0, 0)
    );
    const quaternionAngle = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-CAMERA_ANGLE, 0, 0)
    );

    //world transform
    const obj = this.target.fetchObject3D();
    let position = new THREE.Vector3();
    let quaternion = new THREE.Quaternion();
    obj.matrixWorld.decompose(position, quaternion, new THREE.Vector3());

    const zDiff = this.bbTarget.max.z - this.bbTarget.min.z;
    position.z += zDiff;

    const dir = this.target
      .getDefaultForward()
      .applyQuaternion(quaternionAngle)
      .applyQuaternion(quaternion);

    //TODO compute dist so the bottom of the gameobject is at the bottom of the screen
    let distance = 2.5;

    //compute intersection
    if (obstacle) {
      //TODO opti calcul avec un bvh ? ou avec un plan au niveau du perso?
      this.raycaster.set(position, dir.clone().negate());
      const intersects = this.raycaster.intersectObject(obstacle, true);
      if (intersects.length) {
        intersects.forEach(function (inter) {
          distance = Math.min(distance, inter.distance);
        });
      }
    }

    position.sub(dir.setLength(distance));

    quaternion.multiply(quaternionCam);
    quaternion.multiply(quaternionAngle);

    return { position: position, quaternion: quaternion };
  }

  addRoutine(routine) {
    this.routines.push(routine);
  }

  hasRoutine() {
    return this.routines.length;
  }

  tick(dt, state, targetUUID, obstacle) {
    if (!this.enabled) return;

    if (!state) throw new Error('no state');
    const target = state.getGameObject().find(targetUUID); //TODO peut etre pas obligé de le reset a chaque fois
    this.setTarget(target);

    if (this.hasRoutine()) {
      const currentRoutine = this.routines[0];
      const finished = currentRoutine.tick(dt);
      if (finished) {
        currentRoutine.onEnd();
        this.routines.shift(); //remove
      }
    } else if (this.isFilmingTarget()) {
      this.focusTarget(obstacle);
    }
  }
}

export class Routine {
  constructor(tick, onEnd) {
    this.tick = tick;
    this.onEnd = onEnd;
  }
}
