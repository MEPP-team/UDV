/** @format */

import './UDVDebugger.css';

import { ShadowMapViewer } from 'three/examples/jsm/utils/ShadowMapViewer.js';

export class UDVDebugger {
  constructor(parent) {
    this.root = this.html();
    this.canvasHeightmap;
    parent.appendChild(this.root);
  }

  html() {
    const result = document.createElement('div');
    result.id = 'udv_debugger';
    return result;
  }

  displayShadowMap(light, renderer) {
    if (!this.dirLightShadowMapViewer) {
      const dirLightShadowMapViewer = new ShadowMapViewer(light);
      const size = window.innerWidth * 0.15;

      dirLightShadowMapViewer.position.x = 10;
      dirLightShadowMapViewer.position.y = 10;
      dirLightShadowMapViewer.size.width = size;
      dirLightShadowMapViewer.size.height = size;
      dirLightShadowMapViewer.update(); //Required when setting position or size directly

      this.dirLightShadowMapViewer = dirLightShadowMapViewer;
    }

    if (light.shadow.map) {
      this.dirLightShadowMapViewer.render(renderer);
      // this.dirLightShadowMapViewer.updateForWindowResize();
    }
  }

  displayHeightmap(avatarGO) {
    const _this = this;
    if (!this.canvasHeightmap) {
      this.heightmap = document.createElement('img');
      this.heightmap.src = '../server/worlds/heightmap/heightmap_1.png';

      this.canvasHeightmap = document.createElement('canvas');
      this.root.appendChild(this.canvasHeightmap);

      this.heightmap.onload = function () {
        _this.canvasHeightmap.width = _this.heightmap.width;
        _this.canvasHeightmap.height = _this.heightmap.height;

        _this
          .loadConfigFile('../server/worlds/worlds.json')
          .then(function (json) {
            _this.heightmapData = json.worlds[0].gameObject.components[1].data;
            _this.setSize(
              _this.canvasHeightmap.width,
              _this.canvasHeightmap.height
            );
            _this.displayHeightmap(avatarGO);
          });
      };
    }

    if (this.heightmapData && avatarGO) {
      //draw
      let context = this.canvasHeightmap.getContext('2d');
      context.drawImage(this.heightmap, 0, 0);

      const origin = {
        x: 0,
        y: this.canvasHeightmap.height,
      };

      const g = this.heightmapData.heightmap_geometry;

      // "heightmap_geometry": {
      //   "bounding_box": {
      //     "min": {
      //       "x": -88.3758404553837,
      //       "y": -68.12210273742676,
      //       "z": -116.18017286940449
      //     },
      //     "max": {
      //       "x": 83.73530838944043,
      //       "y": 38.518978118896484,
      //       "z": 101.50655139645824
      //     }
      //   },
      //   "heightmap_min": -21.200027160644535,
      //   "heightmap_max": 3.3274214363098196
      // }

      const pixelWorldUnit = {
        width:
          (g.bounding_box.max.x - g.bounding_box.min.x) /
          this.canvasHeightmap.width,
        height:
          (g.bounding_box.max.y - g.bounding_box.min.y) /
          this.canvasHeightmap.height,
      };

      const loc = {
        x: avatarGO.transform.position.x / pixelWorldUnit.width,
        y: avatarGO.transform.position.y / pixelWorldUnit.height,
      };
      // console.log(loc);

      context.beginPath();
      context.arc(
        this.canvasHeightmap.width + loc.x + origin.x,
        loc.y + origin.y,
        50,
        0,
        2 * Math.PI,
        false
      );
      context.fillStyle = 'green';
      context.fill();
    }
  }

  setSize(w, h) {
    this.root.style.width = w + 'px';
    this.root.style.height = h + 'px';
  }

  //TODO used twice put it in a UTILS
  async loadConfigFile(filePath, cb) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'GET',
        url: filePath,
        datatype: 'json',
        success: (data) => {
          resolve(data);
        },
        error: (e) => {
          console.error(e);
          reject();
        },
      });
    });
  }
}
