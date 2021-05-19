import { DocumentModule } from "../../Documents/DocumentModule";
import { CityObjectModule } from "../../CityObjects/CityObjectModule";
import { LinkService } from "../Model/LinkService";
import { DocumentLinkInterface } from "./DocumentLinkInterface";
import { CityObjectLinkInterface } from "./CityObjectLinkInterface";
import { DocumentInspectorWindow } from "../../Documents/View/DocumentInspectorWindow";
import { LinkProvider } from "../ViewModel/LinkProvider";
import { DocumentView } from "../../Documents/View/DocumentView";
import { CityObjectWindow } from "../../CityObjects/View/CityObjectWindow";

/**
 * Represents the visual interface of the link module. This class contains
 * two different interfaces: one for the document and the other for the city
 * objects.
 */
export class LinkView {
  /**
   * Constructs the link view.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {CityObjectModule} cityObjectModule The city object module.
   * @param {LinkProvider} linkProvider The link service.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls 
   */
  constructor(documentModule, cityObjectModule, linkProvider, itownsView,
    cameraControls) {

    /**
     * A reference to the document view.
     * 
     * @type {DocumentView}
     */
    this.documentView = documentModule.view;

    /**
     * A reference to the city object window.
     * 
     * @type {CityObjectWindow}
     */
    this.cityObjectView = cityObjectModule.view;

    /**
     * The interface extensions for the document module.
     * 
     * @type {DocumentLinkInterface}
     */
    this.documentInterface = new DocumentLinkInterface(documentModule,
      linkProvider, itownsView, cameraControls);

    /**
     * The interface extensions for the city object module.
     * 
     * @type {CityObjectLinkInterface}
     */
    this.cityObjectInterface = new CityObjectLinkInterface(this,
      cityObjectModule, linkProvider);
  }

  /**
   * Request the display of the documents windows.
   */
  requestDisplayDocuments() {
    this.documentView.enable();
  }

  /**
   * Request the display of the city objects window.
   */
  requestDisplayCityObjects() {
    this.cityObjectView.enable();
  }
}