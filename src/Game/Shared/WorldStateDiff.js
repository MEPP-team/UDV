/** @format */

//light object => worldstate(t) + worldstatediff(t+1) = worldstate(t+1)

module.exports = class WorldStateDiff {
  constructor(json) {
    if (!json) throw new Error('no json');

    //value from t+1 worldstate
    this.timestamp = json.timestamp;

    //gameobjects uuid
    this.gameObjectsUUID = json.gameObjectsUUID || [];

    //gameobject which need update
    this.outdatedGameObjectsJSON = json.outdatedGameObjectsJSON || {};
  }

  getOutdatedGameObjectsJSON() {
    return this.outdatedGameObjectsJSON;
  }

  getGameObjectsUUID() {
    return this.gameObjectsUUID;
  }

  getTimeStamp() {
    return this.timestamp;
  }

  toJSON() {

    return {
      timestamp: this.timestamp,
      gameObjectsUUID: this.gameObjectsUUID,
      outdatedGameObjectsJSON: this.outdatedGameObjectsJSON,
    };
  }
};
