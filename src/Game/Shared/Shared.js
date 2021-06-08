/** @format */

const commnJsComponents = require('./Components/Components');

const commonJsCommand = require('./Command');

const commonJsGameObject = require('./GameObject/GameObject');

const commonJsRender = require('./GameObject/Components/Render');

const commonJsWorld = require('./World');

const commonJsWorldState = require('./WorldState');

const commonJsWorldStateDiff = require('./WorldStateDiff');

const THREE = require('three');

module.exports = {
  Components: commnJsComponents,
  Command: commonJsCommand,
  GameObject: commonJsGameObject,
  Render: commonJsRender,
  World: commonJsWorld,
  WorldState: commonJsWorldState,
  WorldStateDiff: commonJsWorldStateDiff,
  THREE: THREE,
};
