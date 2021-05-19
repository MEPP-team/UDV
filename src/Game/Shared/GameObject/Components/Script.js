/** @format */

const THREE = require('three');

const ScriptModule = class Script {
  constructor(parent, json) {
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.idScripts = json.idScripts || [];
    this.type = json.type || ScriptModule.TYPE;
    this.conf = json.conf || {};

    //internal
    this.scripts = {};
  }

  getConf() {
    return this.conf;
  }

  initAssets(assetsManager, udvShared) {
    const _this = this;
    this.idScripts.forEach(function (id) {
      const constructor = assetsManager.fetchScript(id);
      _this.scripts[id] = new constructor(_this.conf, udvShared);
    });
  }

  execute(event, params) {
    const _this = this;

    this.idScripts.forEach(function (idScript) {
      _this.executeScript(idScript, event, params);
    });
  }

  executeScript(id, event, params) {
    let s = this.scripts[id];

    if (s[event]) {
      return s[event].apply(s, [this.parent].concat(params));
    } else {
      return null;
    }
  }

  getScripts() {
    return this.scripts;
  }

  isServerSide() {
    return true;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      idScripts: this.idScripts,
      conf: this.conf,
      type: ScriptModule.TYPE,
    };
  }
};

ScriptModule.TYPE = 'Script';
ScriptModule.EVENT = {
  INIT: 'init', //when added
  TICK: 'tick', //every tick
  LOAD: 'load', //at world load return promises
  COLLISION: 'onCollision', //when collision is detected
};

module.exports = ScriptModule;
