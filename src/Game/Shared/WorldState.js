/**
 * Object send by server to client to render the world
 *
 * @format
 */
const THREE = require('three');
const GameObject = require('./GameObject/GameObject');
const WorldStateDiff = require('./WorldStateDiff');

const WorldStateModule = class WorldState {
  constructor(json) {
    if (!json) throw new Error('no json');
    /******************DATA***************************/

    //gameobjects
    this.gameObject = null;
    if (json.gameObject) this.gameObject = new GameObject(json.gameObject);

    //timestamp
    this.timestamp = json.timestamp || -1;

    //coord of the origin
    this.origin = json.origin || null;

    /******************INTERNAL***********************/
  }

  add(diff) {
    const uuidGO = diff.getGameObjectsUUID();
    const outdatedGameObjectsJSON = diff.getOutdatedGameObjectsJSON();

    const newGO = this.gameObject.clone();
    newGO.traverse(function (g) {
      const uuid = g.getUUID();

      if (!uuidGO.includes(uuid)) {
        //delete all gameobject not in diff
        console.log(g, ' is not in the scene anymore');
        g.removeFromParent();
      } else {
        //update transform of the outdated one
        if (outdatedGameObjectsJSON[uuid]) {
          g.setTransformFromJSON(outdatedGameObjectsJSON[uuid].transform);
          delete outdatedGameObjectsJSON[uuid]; //remove it
        }
      }
    });

    //create others which existed not yet
    for (let uuid in outdatedGameObjectsJSON) {
      const json = outdatedGameObjectsJSON[uuid];
      const go = new GameObject(json, null);
      const parent = newGO.find(json.parentUUID);
      parent.addChild(go);
    }

    //DEBUG
    let count = 0;
    newGO.traverse(function (g) {
      const uuid = g.getUUID();
      if (uuidGO.includes(uuid)) count++;
    });
    if (uuidGO.length != count) {
      debugger;
    }

    const result = new WorldState({
      gameObject: null,
      timestamp: diff.getTimeStamp(),
    });
    result.setGameObject(newGO); //avoid a serialization/deserialization

    return result;
  }

  includes(uuid) {
    if (this.gameObject.find(uuid)) {
      return true;
    }
    return false;
  }

  toDiff(stateClient) {
    const gameObjectsUUID = [];
    const outdatedGameObjectsJSON = {};
    const alreadyInOutdated = [];
    this.gameObject.traverse(function (g) {
      gameObjectsUUID.push(g.getUUID()); //register all uuid
      if (!g.isStatic() && !alreadyInOutdated.includes(g)) {
        //if is not static and is not already register
        if (!stateClient.includes(g.getUUID()) || g.isOutdated()) {
          //if not in the last state or outdated
          outdatedGameObjectsJSON[g.getUUID()] = g.toJSON();
          //avoid to add child of an outdated object twice because toJSON is recursive
          g.traverse(function (outdated) {
            alreadyInOutdated.push(outdated.getUUID());
          });
        }
      }
    });

    return new WorldStateDiff({
      gameObjectsUUID: gameObjectsUUID,
      outdatedGameObjectsJSON: outdatedGameObjectsJSON,
      timestamp: this.timestamp,
    });
  }

  clone() {
    return new WorldState({
      gameObject: this.gameObject.toJSON(),
      timestamp: this.timestamp,
      origin: this.origin,
    });
  }

  setGameObject(g) {
    this.gameObject = g;
  }

  getOrigin() {
    return this.origin;
  }

  getTimestamp() {
    return this.timestamp;
  }

  getGameObject() {
    return this.gameObject;
  }

  toJSON() {
    let gameObjectData = null;
    if (this.gameObject) gameObjectData = this.gameObject.toJSON();

    return {
      type: WorldStateModule.TYPE,
      gameObject: gameObjectData,
      timestamp: this.timestamp,
      origin: this.origin,
    };
  }
};

WorldStateModule.TYPE = 'WorldState';

////STATIC
WorldStateModule.interpolate = function (w1, w2, ratio) {
  if (!w2 || false) return w1;

  //interpolate go
  const mapW2 = {};
  w2.getGameObject().traverse(function (go) {
    mapW2[go.getUUID()] = go;
  });
  const result = w1.clone();
  result.gameObject.traverse(function (go) {
    if (mapW2[go.getUUID()]) {
      GameObject.interpolateInPlace(go, mapW2[go.getUUID()], ratio);
    }
  });

  return result;
};

module.exports = WorldStateModule;
