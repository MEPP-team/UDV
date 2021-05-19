/** @format */

import * as THREE from 'three';

const THREEUtils = {
  textureEncoding: THREE.RGBDEncoding,

  addLights(scene) {
    //lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(100, 100, 500);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.updateMatrixWorld();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    return { directionalLight, ambientLight };
  },

  initRenderer(renderer, skyColor) {
    // Set sky color to blue
    renderer.setClearColor(skyColor, 1);

    renderer.outputEncoding = this.textureEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    // to antialias the shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.toneMappingExposure = 1;
  },
};

export { THREEUtils };
