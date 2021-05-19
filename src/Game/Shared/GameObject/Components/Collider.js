/** @format */

const THREE = require('three');
const ScriptComponent = require('./Script');
const { Circle, Polygon } = require('detect-collisions');

const ColliderModule = class Collider {
  constructor(parent, json) {
    if (!json) throw new Error('no json');
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.shapesJSON = json.shapes || [];

    this.body = json.body || false;

    //data
    this.shapeWrappers = [];
    this.createShapeWrappers();
  }

  isBody() {
    return this.body;
  }

  initAssets(assetsManager) {
    //nada
  }

  createShapeWrappers() {
    const shapeWrappers = this.shapeWrappers;
    const _this = this;
    this.shapesJSON.forEach(function (json) {
      const wrapper = new ShapeWrapper(_this.parent, json);
      shapeWrappers.push(wrapper);
    });
  }

  onCollision(result, gCtx) {
    this.parent.traverse(function (g) {
      g.executeScripts(ScriptComponent.EVENT.COLLISION, [result, gCtx]);
    });
  }

  getShapeWrappers() {
    return this.shapeWrappers;
  }

  update() {
    const worldTransform = this.parent.computeWorldTransform();
    this.shapeWrappers.forEach(function (b) {
      b.update(worldTransform);
    });
  }

  isServerSide() {
    return true;
  }

  setShapesJSON(json) {
    this.shapesJSON = json;
  }

  getShapesJSON() {
    return this.shapesJSON;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      type: ColliderModule.TYPE,
      shapes: this.shapesJSON,
      body: this.body,
    };
  }
};

ColliderModule.TYPE = 'Collider';

module.exports = ColliderModule;

class ShapeWrapper {
  constructor(gameObject, json) {
    this.gameObject = gameObject;
    this.json = json;

    //sgape detect - collision
    this.shape = null;

    this.initFromJSON(json);
  }

  getShape() {
    return this.shape;
  }

  getGameObject() {
    return this.gameObject;
  }

  initFromJSON(json) {
    switch (json.type) {
      case 'Circle':
        const circle = new Circle(json.center.x, json.center.y, json.radius);

        this.update = function (worldtransform) {
          circle.x = json.center.x + worldtransform.position.x;
          circle.y = json.center.y + worldtransform.position.y;
        };

        this.shape = circle;
        break;
      case 'Polygon':
        const points = [];
        json.points.forEach(function (p) {
          points.push([p.x, p.y]);
        });

        const polygon = new Polygon(0, 0, points);

        //attach userData to perform update
        this.update = function (worldtransform) {
          const points = [];
          json.points.forEach(function (p) {
            const point = [
              p.x + worldtransform.position.x,
              p.y + worldtransform.position.y,
            ];
            points.push(point);
            //TODO handle rotation
          });
          polygon.setPoints(points);
        };

        this.shape = polygon;
        break;
      default:
    }

    //ref private to access this wrapper from shape collision (with event bad perf?)
    this.shape.getGameObject = this.getGameObject.bind(this);
  }
}
