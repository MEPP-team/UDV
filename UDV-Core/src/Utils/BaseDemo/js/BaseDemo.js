import {
  ModuleView
} from '../../ModuleView/ModuleView.js';

/**
 * Represents the base HTML content of a demo for UDV and provides methods to
 * dynamically add module views.
 */
export class BaseDemo {
  constructor(config = {}) {
    this.modules = {};
    this.moduleNames = {};
    this.moduleActivation = {};
    this.moduleBindings = {};
    this.requireAuthModules = [];
    this.authService;
    this.config = {};
    this.parentElement;
    this.view; // itowns view (3d scene)
    this.extent; // itowns extent (city limits)
    this.controls;
    this.itowns = itowns;
    // Temporal is currently disabled and will be reintroduced in a new
    // version based on a 3D Tiles extension
    this.temporal = false;
    ///// Config values for some file paths
    // iconFolder    : folder for icons (for the modules menu)
    // imageFolder   : folder for the logo files (for LIRIS and IMU)
    // logoIMUFile   : filename for IMU logo
    // logoLIRISFile : filename for LIRIS logo
    config = config || {};
    this.iconFolder = config.iconFolder || 'icon';
    this.imageFolder = config.imageFolder || 'img';
    this.logoIMUFile = config.logoIMUFile || 'logo-imu.png';
    this.logoLIRISFile = config.logoLIRISFile || 'logo-liris.png';
  }

  /**
   * Returns the basic html content of the demo
   */
  get html() {
    return /*html*/ `
            <header id="${this.headerId}">
                <div>
                    <h1>UDV &bull;</h1>
                    <div id="${this.authFrameLocationId}"></div>
                </div>
                <div id="_base_demo_struct_header_panel">
                    <img id="logoIMU" src="${this.imageFolder}/${this.logoIMUFile}" />
                    <img id="logoLIRIS" src="${this.imageFolder}/${this.logoLIRISFile}" />
                    <p style="display: inline-block; color: white; margin: 0;">
                        Icons made by <a href="https://www.freepik.com/"
                        title="Freepik">Freepik</a> from
                        <a href="https://www.flaticon.com/"
                        title="Flaticon">www.flaticon.com</a><br> is licensed by
                        <a href="http://creativecommons.org/licenses/by/3.0/"
                        title="Creative Commons BY 3.0" target="_blank">
                        CC 3.0 BY</a>
                    </p>
                </div>
            </header>
            <div id="_base_demo_stuct_main_panel">
                <nav>
                    <ul id="${this.menuId}">
                    </ul>
                </nav>
                <section id="${this.contentSectionId}">
                    <div id="${this.viewerDivId}"></div>
                </section>
            </div>
        `;
  }

  /**
   * Returns the html element representing the upper-left frame of the UI,
   * which contains informations
   * about the logged in user.
   */
  get authenticationFrameHtml() {
    return /*html*/ `
            <div id="${this.authenticationMenuLoggedInId}">
                <div id="${this.authenticationUserNameId}"></div>
                <button type="button" id="${this.authenticationLogoutButtonId}"
                class="logInOut">Logout</button>
            </div>
            <div id="${this.authenticationMenuLoggedOutId}">
                <button type="button" id="${this.authenticationLoginButtonId}"
                class="logInOut">Sign in</button>
            </div>
        `;
  }

  /**
   * Appends the demo HTML to an HTML element.
   *
   * @param htmlElement The parent node to add the demo into. The
   * recommended way of implementing the demo is simply to have an
   * empty body and call this method with `document.body` as
   * parameter.
   */
  appendTo(htmlElement) {
    this.parentElement = htmlElement;
    let div = document.createElement('div');
    div.innerHTML = this.html;
    div.id = this.mainDivId;
    htmlElement.appendChild(div);
  }

  //////// MODULE MANAGEMENT

  /**
   * Adds a new module view to the demo.
   *
   * @param moduleId A unique id. Must be a string without spaces. It
   * will be used to generate some HTML ids in the page. It will also
   * be used to look for an icon to put with the button
   * @param moduleClass The module view class. Must implement some
   * methods (`enable`, `disable` and `addEventListener`). The
   * recommended way of implementing them is to extend the
   * `ModuleView` class, as explained [on the
   * wiki](https://github.com/MEPP-team/UDV/wiki/Generic-demo-and-modules-with-ModuleView-&-BaseDemo).
   * @param options An object used to specify various options.
   * `options.name` allows you to specify the name that will be
   * displayed in the toggle button. By default, it makes a
   * transformation of the id (like this : myModule -> My Module).
   * `options.type` is the "type" of the module view that defines how
   * it is added to the demo. The default value is `MODULE_VIEW`,
   * which simply adds a toggle button to the side menu. If set to
   * `AUTHENTICATION_MODULE`, an authentication frame will be created
   * in the upper left corner of the page to contain informations
   * about the user. `options.requireAuth` allows you to
   * specify if this module can be shown without authentication (ie.
   * if no user is logged in). The default value is `false`. If set to
   * `true`, and no athentication module was loaded, it has no effect
   * (the module view will be shown). `options.binding` is the shortcut
   * key code to toggle the module. By default, no shortcut is created.
   */
  addModuleView(moduleId, moduleClass, options = {}) {
    if ((typeof(moduleClass.enable) !== 'function') ||
      (typeof(moduleClass.disable) !== 'function')) {
      throw 'A module must implement at least an enable() and a disable() methods';
    }

    //Default name is the id transformed this way :
    // myModule -> My Module
    // my_module -> My module
    let moduleName = moduleId
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, (str) => str.toUpperCase());
    let type = BaseDemo.MODULE_VIEW;
    let requireAuth = false;
    if (!!options) {
      if (!!options.type) {
        if (options.type === BaseDemo.MODULE_VIEW ||
          options.type === BaseDemo.AUTHENTICATION_MODULE) {
          type = options.type;
        } else {
          throw `Invalid value for option 'type' : '${options.type}'`;
        }
      }
      if (!!options.name) {
        moduleName = options.name;
      }
      if (!!options.requireAuth) {
        requireAuth = options.requireAuth;
      }
    }
    const binding = options.binding;

    this.modules[moduleId] = moduleClass;
    this.moduleNames[moduleName] = moduleId;
    this.moduleActivation[moduleId] = false;

    moduleClass.addEventListener(ModuleView.EVENT_ENABLED, () => {
      this.moduleActivation[moduleId] = true;

    });
    moduleClass.addEventListener(ModuleView.EVENT_DISABLED, () => {
      this.moduleActivation[moduleId] = false;
    });

    switch (type) {
      case BaseDemo.MODULE_VIEW:
        //create a new button in the menu
        this.createMenuButton(moduleId, moduleName, binding);
        break;
      case BaseDemo.AUTHENTICATION_MODULE:
        this.createAuthenticationFrame(moduleId);
        break;
      default:
        throw `Unknown module type : ${type}`;
    }

    if (requireAuth) {
      this.requireAuthModules.push(moduleId);
      this.updateAuthentication();
    }

    if (!!binding) {
      this.moduleBindings[binding] = moduleId;
    }
  }

  /**
   * Creates a new button in the side menu.
   * @param moduleId The module id.
   * @param buttonText The text to display in the button.
   * @param {String} [accessKey] The key binding for the module.
   */
  createMenuButton(moduleId, buttonText, accessKey) {
    let button = document.createElement('li');
    button.id = this.getModuleButtonId(moduleId);
    button.innerHTML = `<p class="_base_demo_menu_hint">${buttonText}</p>`;
    if (!!accessKey) {
      button.accessKey = accessKey;
    }
    this.menuElement.appendChild(button);
    let icon = document.createElement('img');

    //creating an icon
    icon.setAttribute('src', `${this.iconFolder}/${moduleId}.svg`)
    icon.className = 'menuIcon';
    button.insertBefore(icon, button.firstChild);

    //define button behavior
    button.onclick = (() => {
      this.toggleModule(moduleId);
    }).bind(this);
    let moduleClass = this.getModuleById(moduleId);

    //dynamically color the button
    moduleClass.parentElement = this.viewerDivElement;
    moduleClass.addEventListener(ModuleView.EVENT_ENABLED, () => {
      button.className = 'choiceMenu choiceMenuSelected';

    });
    moduleClass.addEventListener(ModuleView.EVENT_DISABLED, () => {
      button.className = 'choiceMenu';
    });
    moduleClass.disable();
  }

  /**
   * Creates an authentication frame for the authentication module.
   * @param authModuleId The id of the authentication module.
   */
  createAuthenticationFrame(authModuleId) {
    let frame = document.createElement('div');
    frame.id = this.authenticationFrameId;
    frame.innerHTML = this.authenticationFrameHtml;
    this.authFrameLocationElement.appendChild(frame);
    const authView = this.getModuleById(authModuleId);
    authView.parentElement = this.viewerDivElement;
    const authService = authView.authenticationService;
    this.authenticationLoginButtonElement.onclick = () => {
      if (this.isModuleActive(authModuleId)) {
        authView.disable();
      } else {
        authView.enable();
      }
    };
    this.authenticationLogoutButtonElement.onclick = () => {
      try {
        authService.logout();
      } catch (e) {
        console.error(e);
      }
    };

    authService.addObserver(this.updateAuthentication.bind(this));
    this.authService = authService;
    this.updateAuthentication();
  }

  /**
   * This method should be called when the authentication state changes
   *  (ie. a user log in / out), or when a module is added. It has two
   *  purposes :
   *  1. To update the upper-left square of the side menu (which contains
   *     use informations)
   *  2. To show / hide the modules that require authentication (as defined
   *     by the `options` parameter in the method `addModuleView`
   */
  updateAuthentication() {
    if (!!this.authService) {
      if (this.authService.isUserLoggedIn()) {
        const user = this.authService.getUser();
        this.authenticationMenuLoggedInElement.hidden = false;
        this.authenticationMenuLoggedOutElement.hidden = true;
        this.authenticationUserNameElement.innerHTML =
          `Logged in as <em>${user.firstname} ${user.lastname}</em>`;
        for (let mid of this.requireAuthModules) {
          this.getModuleButton(mid).style.removeProperty('display');
        }
      } else {
        this.authenticationMenuLoggedInElement.hidden = true;
        this.authenticationMenuLoggedOutElement.hidden = false;
        for (let mid of this.requireAuthModules) {
          this.getModuleButton(mid).style.setProperty('display',
            'none');
        }
      }
    }
  }

  /**
   * Returns if the module view is currently enabled or not.
   * @param moduleId The module id.
   */
  isModuleActive(moduleId) {
    return this.moduleActivation[moduleId];
  }

  /**
   * Returns the module view class by its id.
   * @param moduleId The module id.
   */
  getModuleById(moduleId) {
    return this.modules[moduleId];
  }

  /**
   * If the module view is enabled, disables it, else, enables it.
   * @param moduleId The module id.
   */
  toggleModule(moduleId) {
    if (!this.isModuleActive(moduleId)) {
      this.getModuleById(moduleId).enable();
    } else {
      this.getModuleById(moduleId).disable();
    }
  }

  getModuleButtonId(moduleId) {
    return `_base_demo_menu_button${moduleId}`;
  }

  // Get module button element
  getModuleButton(moduleId) {
    return document.getElementById(this.getModuleButtonId(moduleId));
  }

  /**
   * Initialize the iTowns 3D view.
   */
  init3DView() {

    // ********* INIT ITOWNS VIEW
    // Define projection used in iTowns viewer (taken from
    // https://epsg.io/3946, Proj4js section)
    itowns.proj4.defs('EPSG:3946', '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
      ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

    // Define geographic extent: CRS, min/max X, min/max Y
    this.extent = new itowns.Extent(
      'EPSG:3946',
      1837860.980127206, 1847648.6685636174,
      5169347.42659997, 5180280.0400808845);

    // `viewerDiv` will contain iTowns' rendering area (`<canvsas>`)
    let viewerDiv = document.getElementById('viewerDiv');
    // Instantiate PlanarView (iTowns' view that will hold the layers)
    // The skirt allows to remove the cracks between the terrain tiles
    this.view = new itowns.PlanarView(viewerDiv, this.extent, {
      disableSkirt: false
    });


    //menuGlobe.addImageryLayersGUI(this.view.getLayers(function filterColor(l) { return l.isColorLayer; }));
    // this.menuGlobe.addElevationLayersGUI(this.view.getLayers(function filterElevation(l) { return l.isElevationLayer; }));
    // console.log(debug);
    // this.debug = new debug.Debug(this.view, this.menuGlobe.gui);
    // debug.createTileDebugUI(this.menuGlobe.gui, this.view, this.view.tileLayer, this.debug);

    // ********* ADD TERRAIN LAYERS (WMS imagery and WMS elevation)
    // These layer are served by the grandLyon
    // Add a WMS imagery source
    let wmsImagerySource = new itowns.WMSSource({
      extent: this.extent,
      name: 'Ortho2009_vue_ensemble_16cm_CC46',
      url: 'https://download.data.grandlyon.com/wms/grandlyon',
      version: '1.3.0',
      projection: 'EPSG:3946',
      format: 'image/jpeg',
    });
    // Add a WMS imagery layer
    let wmsImageryLayer = new itowns.ColorLayer('wms_imagery', {
      updateStrategy: {
        type: itowns.STRATEGY_DICHOTOMY,
        options: {},
      },
      source: wmsImagerySource,
    });
    this.view.addLayer(wmsImageryLayer);

    // Add a WMS elevation source
    let wmsElevationSource = new itowns.WMSSource({
      extent: this.extent,
      url: 'https://download.data.grandlyon.com/wms/grandlyon',
      name: 'MNT2012_Altitude_10m_CC46',
      projection: 'EPSG:3946',
      heightMapWidth: 256,
      format: 'image/jpeg',
    });
    // Add a WMS elevation layer
    let wmsElevationLayer = new
    itowns.ElevationLayer('wms_elevation', {
      useColorTextureElevation: true,
      colorTextureElevationMinZ: 37,
      colorTextureElevationMaxZ: 240,
      source: wmsElevationSource,
    });
    this.view.addLayer(wmsElevationLayer);

    // Add extruded polygons (buildings)
    let tile;

    function colorBuildings(properties) {
      if (properties.id.indexOf('bati_remarquable') === 0) {
        return color.set(0x5555ff);
      }
      if (properties.id.indexOf('bati_industriel') === 0) {
        return color.set(0xff5555);
      }
      return color.set(0xeeeeee);
    }

    function extrudeBuildings(properties) {
      return properties.hauteur;
    }

    let meshes = [];
    let meshesMask = [];
    let scaler = ( /* dt */ ) => {
      var i;
      var mesh;
      if (meshes.length) {
        this.view.notifyChange();
      }
      for (i = 0; i < meshes.length; i++) {
        mesh = meshes[i];
        mesh.scale.z = Math.min(
          1.0, mesh.scale.z + 0.1);
        mesh.updateMatrixWorld(true);
      }
      meshes = meshes.filter(function filter(m) {
        return m.scale.z < 1;
      });
    }

    function acceptFeature(properties) {
      return !!properties.hauteur;
    }

    function altitudeBuildings(properties) {
      return properties.z_min - properties.hauteur;
    }

    this.view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER, scaler);

    var wfsBuildingSource = new itowns.WFSSource({
      url: 'https://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wfs?',
      version: '2.0.0',
      typeName: 'BDTOPO_BDD_WLD_WGS84G:bati_remarquable,BDTOPO_BDD_WLD_WGS84G:bati_indifferencie,BDTOPO_BDD_WLD_WGS84G:bati_industriel',
      projection: 'EPSG:4326',
      ipr: 'IGN',
      format: 'application/json',
      zoom: {
        min: 4,
        max: 4
      },
      extent: {
        west: 4.568,
        east: 5.18,
        south: 45.437,
        north: 46.03,
      },
    });

    var wfsBuildingLayer = new itowns.GeometryLayer('wfsBuilding', new itowns.THREE.Group(), {
      update: itowns.FeatureProcessing.update,
      convert: itowns.Feature2Mesh.convert({
        color: colorBuildings,
        batchId: function(property, featureId) {
          return featureId;
        },
        extrude: extrudeBuildings,
        altitude: altitudeBuildings
      }),
      onMeshCreated: function scaleZ(mesh) {
        mesh.scale.z = 0.01;
        meshes.push(mesh);
      },
      filter: acceptFeature,
      overrideAltitudeInToZero: true,
      projection: 'EPSG:3946',
      source: wfsBuildingSource,
    });

    this.view.addLayer(wfsBuildingLayer);

    // ********* ADD 3D BUILDING LAYER (3D Tiles)
    // This building layer represents Lyon in 2015 and is served from
    // grand lyon alpha server
    // let $3dTilesLayer = new itowns.GeometryLayer(
    //     this.config['3DTilesLayerID'], new THREE.Group());
    // $3dTilesLayer.name = 'Lyon-2015';
    // $3dTilesLayer.url =
    //     this.config['3DTilesLayerURL'];
    // $3dTilesLayer.protocol = '3d-tiles';
    // $3dTilesLayer.overrideMaterials = true;
    //
    // itowns.View.prototype.addLayer.call(this.view, $3dTilesLayer);


    // ********* COLOR AND ALTITUDE BASIC SETTINGS
    let color = new itowns.THREE.Color();
    let rgb;

    // ********* Function to set altitude relative to tile altitude
    var altitude = (properties, contour) => {
      var result;
      var z = 0;
      if (contour) {
        result = itowns.DEMUtils.getElevationValueAt(this.view.tileLayer, contour, 0, tile);

        if (!result) {
          result = itowns.DEMUtils.getElevationValueAt(this.view.tileLayer, contour, 0);
        }
        tile = [result.tile];
        if (result) {
          z = result.z;
        }
        return z + 10;
      }
    };

    // ********* Set the absolute value for polygons layer altitude
    var altitudePoly = 200;

    // ********* Function to get color for lines
    var colorLine = function(properties) {
      if (properties) {
        var rgb = properties.couleur.split(' ');
        return color.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
      } else {
        return color.setRGB(1, 1, 1);
      }
    };


    //******** FUNCTIONS TO CREATE LAYERS FROM CONFIG JSON FILE
    itowns.Fetcher.json('../../../examples/MAM/data/config/layers_settings.json')
      .then(
        (configList) => {
          for (var i in configList) {
            let geometry = configList[i].geometry;
            let protocol = configList[i].source.protocol;
            let config;
            let size;
            let linewidth;

            let addGeometryLayerFromConfig = (config) => {
              if (geometry === "polygons"){
                config.altitude = altitudePoly
              }
              else if (geometry === "lines"){
                config.altitude = altitude;
                if (config.linewidth){
                  linewidth = config.linewidth
                }
                else {
                  linewidth = 50 //default
                };
                config.onMeshCreated = function(result) {
                  result.traverse(function _setLineWidth(mesh) {
                    if (mesh.material) {
                      mesh.material.linewidth = linewidth;
                    }
                  });
                }
              }
              else if (geometry === "points"){
                config.altitude = altitude;
                if (config.size){
                  size = config.size
                }
                else {
                  size = 50 //default
                };
                config.onMeshCreated = function(result) {
                  result.traverse(function _setPointSize(mesh) {
                    if (mesh.material) {
                      mesh.material.size = size;
                    }
                  });
                }
              };
              config.update = itowns.FeatureProcessing.update;
              config.convert = itowns.Feature2Mesh.convert({
                color: new itowns.THREE.Color().setRGB(
                  config.color.red,
                  config.color.green,
                  config.color.blue
                ),
                altitude: config.altitude,
              });
              config.overrideAltitudeInToZero = true;
              config.projection = config.source.projection;
              config.source = config.source;
              let layer = new itowns.GeometryLayer(
                config.id,
                new itowns.THREE.Group(),
                config
              );
              return this.view.addLayer(layer);
            };

            //// If no protocol, set configuration
            if (protocol === undefined) {
              let configuration = configList[i];
              var promise = new Promise(
                function(resolve, reject) {
                  configuration.source = new itowns.FileSource(configList[i].source);
                  resolve(configuration);
                }
              );
              promise.then(addGeometryLayerFromConfig);
            }

            //// If protocol === "wfs", set configuration
            else if (protocol === "wfs") {
              let configuration = configList[i];
              var promise = new Promise(
                function(resolve, reject) {
                  configuration.source = new itowns.WFSSource(configList[i].source);
                  resolve(configuration);
                }
              );
              promise.then(addGeometryLayerFromConfig);
            }
          }
        }
      );

    // ********* 3D Elements
    // Lights
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 0, 20000);
    directionalLight.updateMatrixWorld();
    this.view.scene.add(directionalLight);

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambientLight.position.set(0, 0, 3000);
    directionalLight.updateMatrixWorld();
    this.view.scene.add(ambientLight);

    // Camera
    let p = {
      coord: this.extent.center(),
      heading: -49.6,
      range: 3000,
      tilt: 17
    };
    itowns.CameraUtils.transformCameraToLookAtTarget(this.view, this.view.camera.camera3D, p);

    // Controls
    this.controls = new itowns.PlanarControls(this.view, {});

    // Set sky color to blue
    this.view.mainLoop.gfxEngine.renderer.setClearColor(0x6699cc, 1);

    // Request itowns view redraw
    this.view.notifyChange();
  }

  /**
   * Loads a config file. Module views should only be added after calling
   * this method.
   * @param filePath The path to the config file.
   */
  async loadConfigFile(filePath) {
    //loading configuration file
    // see https://github.com/MEPP-team/VCity/wiki/Configuring-UDV
    return $.ajax({
      type: "GET",
      url: filePath,
      datatype: "json",
      success: (data) => {
        this.config = data;
      },
      error: (e) => {
        throw 'Could not load config file : ' + filePath;
      }
    });
  }

  ////////////////////////////////////////////////////////
  // GETTERS FOR HTML IDS AND ELEMENTS OF THE DEMO PAGE //
  ////////////////////////////////////////////////////////

  get mainDivId() {
    return '_base_demo';
  }

  get headerId() {
    return '_base_demo_header';
  }

  get headerElement() {
    return document.getElementById(this.headerId);
  }

  get authFrameLocationId() {
    return '_base_demo_auth_frame_location';
  }

  get authFrameLocationElement() {
    return document.getElementById(this.authFrameLocationId);
  }

  get contentSectionId() {
    return 'contentSection';
  }

  get contentSectionElement() {
    return document.getElementById(this.contentSectionId);
  }

  get viewerDivId() {
    return 'viewerDiv';
  }

  get viewerDivElement() {
    return document.getElementById(this.viewerDivId);
  }

  get menuId() {
    return '_base_demo_menu';
  }

  get menuElement() {
    return document.getElementById(this.menuId);
  }

  get authenticationFrameId() {
    return '_base_demo_profile';
  }

  get authenticationFrameElement() {
    return document.getElementById(this.authenticationFrameId);
  }

  get authenticationLogoutButtonId() {
    return '_base_demo_button_logout';
  }

  get authenticationLogoutButtonElement() {
    return document.getElementById(this.authenticationLogoutButtonId);
  }

  get authenticationLoginButtonId() {
    return '_base_demo_button_login';
  }

  get authenticationLoginButtonElement() {
    return document.getElementById(this.authenticationLoginButtonId);
  }

  get authenticationMenuLoggedInId() {
    return '_base_demo_profile_menu_logged_in';
  }

  get authenticationMenuLoggedInElement() {
    return document.getElementById(this.authenticationMenuLoggedInId);
  }

  get authenticationMenuLoggedOutId() {
    return '_base_demo_profile_menu_logged_out';
  }

  get authenticationMenuLoggedOutElement() {
    return document.getElementById(this.authenticationMenuLoggedOutId);
  }

  get authenticationUserNameId() {
    return '_base_demo_profile_name';
  }

  get authenticationUserNameElement() {
    return document.getElementById(this.authenticationUserNameId);
  }

  static get MODULE_VIEW() {
    return 'MODULE_VIEW';
  }

  static get AUTHENTICATION_MODULE() {
    return 'AUTHENTICATION_MODULE';
  }
}
