/**
 * Object with all information about a persistant world
 * each step can export a WorldState
 *
 * @format
 */
const GameObject = require('./GameObject/GameObject');
const ScriptComponent = require('./GameObject/Components/Script');
const ColliderComponent = require('./GameObject/Components/Collider');
const THREE = require('three');
const WorldState = require('./WorldState');
const { Collisions } = require('detect-collisions');

const WorldModule = class World {
  constructor(json, options) {
    if (!json) throw new Error('no json');
    options = options || {};

    //collisions system
    this.collisions = new Collisions();

    /******************DATA***************************/

    //id
    this.uuid = json.uuid || THREE.Math.generateUUID();

    //gameobject
    if (json.gameObject) {
      this.gameObject = new GameObject(json.gameObject);
    } else {
      throw new Error('no go in world');
    }

    //name of the world
    this.name = json.name || 'default_world';

    //origin
    this.origin = json.origin || { lat: 0, lng: 0 };

    /******************INTERNAL***********************/

    //is running on webpage or node app
    this.isServerSide = options.isServerSide || false;
    this.modules = options.modules || {};
    this.listeners = {};
  }

  //custom event
  on(eventID, cb) {
    if (!this.listeners[eventID]) this.listeners[eventID] = [];
    this.listeners[eventID].push(cb);
  }

  notify(eventID, params) {
    if (!this.listeners[eventID]) this.listeners[eventID] = [];
    this.listeners[eventID].forEach(function (cb) {
      cb(params);
    });
  }

  load(onLoad, gCtx) {
    //load gameobject
    this.addGameObject(this.gameObject, gCtx, null, onLoad);
  }

  computePromisesLoad(go, gCtx) {
    //load GameObject
    const promises = [];
    let params = [gCtx, this.isServerSide, this.modules];

    go.traverse(function (g) {
      const scriptC = g.getComponent(ScriptComponent.TYPE);
      if (scriptC) {
        for (let idScript in scriptC.getScripts()) {
          const result = scriptC.executeScript(
            idScript,
            ScriptComponent.EVENT.LOAD,
            params
          );
          if (result) promises.push(result);
        }
      }
    });

    return promises;
  }

  addGameObject(gameObject, gCtx, parent, onLoad = null) {
    const _this = this;

    gameObject.initAssetsComponents(
      gCtx.assetsManager,
      gCtx.UDVShared,
      _this.isServerSide
    );

    Promise.all(this.computePromisesLoad(gameObject, gCtx)).then(function () {
      if (parent) {
        parent.addChild(gameObject);
      } else {
        _this.gameObject = gameObject;
      }

      _this.registerGOCollision(gameObject);
      gameObject.traverse(function (g) {
        g.executeScripts(ScriptComponent.EVENT.INIT, [gCtx]);
      });

      if (onLoad) onLoad();
    });
  }

  registerGOCollision(go) {
    //collisions
    const collisions = this.collisions;
    go.traverse(function (child) {
      const body = child.getComponent(ColliderComponent.TYPE);
      if (body) {
        body.getShapeWrappers().forEach(function (wrapper) {
          collisions.insert(wrapper.getShape());
        });
      }
    });
  }

  unregisterGOCollision(go) {
    //collisions
    go.traverse(function (child) {
      const body = child.getComponent(ColliderComponent.TYPE);
      if (body) {
        body.getShapeWrappers().forEach(function (wrapper) {
          wrapper.getShape().remove();
        });
      }
    });
  }

  removeGameObject(uuid) {
    const go = this.gameObject.find(uuid);
    go.removeFromParent();
    this.unregisterGOCollision(go);
  }

  tick(gCtx) {
    //Tick GameObject
    this.gameObject.traverse(function (g) {
      g.executeScripts(ScriptComponent.EVENT.TICK, [gCtx]);
    });

    //collisions
    const collisions = this.collisions;
    this.gameObject.traverse(function (g) {
      const bC = g.getComponent(ColliderComponent.TYPE);
      if (bC) bC.update();
    });
    collisions.update();

    this.gameObject.traverse(function (g) {
      if (g.isStatic()) return;
      const bC = g.getComponent(ColliderComponent.TYPE);
      if (bC) {
        bC.getShapeWrappers().forEach(function (wrapper) {
          const body = wrapper.getShape();
          const potentials = body.potentials();
          let result = collisions.createResult();
          for (const p of potentials) {
            //in ShapeWrapper shape are link to gameObject
            if (!p.getGameObject().isStatic()) continue;
            if (body.collides(p, result)) {
              bC.onCollision(result, gCtx);
            }
          }
        });
      }
    });
  }

  computeWorldState() {
    const result = new WorldState({
      gameObject: null,
      timestamp: Date.now(),
      origin: this.origin,
    });

    //share same gameobject to avoid gameobject.toJSON then instanciate a new one
    result.setGameObject(this.gameObject);

    return result;
  }

  getGameObject() {
    return this.gameObject;
  }

  getCollisions() {
    return this.collisions;
  }

  getUUID() {
    return this.uuid;
  }

  clone() {
    return new World(this.toJSON());
  }

  toJSON() {
    return {
      gameObject: this.gameObject.toJSON(true),
      name: this.name,
      origin: this.origin,
      type: WorldModule.TYPE,
      uuid: this.uuid,
    };
  }
};

WorldModule.TYPE = 'World';

module.exports = WorldModule;
