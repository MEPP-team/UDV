export function CreateDocument(creationContainer, contributeController){

  this.contributeController = contributeController;
  this.creationContainer = creationContainer;
  this.browserTabs = this.contributeController.documentController.documentBrowser.browserTabID;
console.log(this.browserTabs)
  var docBrowserCreateButton = document.createElement('button');
  docBrowserCreateButton.id = "docBrowserCreateButton";
  var word = document.createTextNode("Create");
  docBrowserCreateButton.appendChild(word);
  document.getElementById(this.browserTabs).appendChild(docBrowserCreateButton);

  this.contributeController.documentController.documentBrowser.refresh(); //original documentBrowser is updated with additional buttons

  // Whether this window is currently displayed or not.
  this.windowIsActive = this.contributeController.documentController.options.active || false;
  /**
   * Creates the research view
   */
  //=============================================================================
  this.initialize = function initialize()
  {
      this.creationContainer.innerHTML =
          '<br/><div id = "creationTitle">Add new document</div><br/>\
          <br/>\
          <button id = "closeCreation">Close</button>\
          <div class="creation">\
          <div id = "creationWindow" ></div></div>\
          <div id ="creationTabs">\
          <button id = "docCreation">Send</button>\
          <button id = "documentPositioner">Place doc</button>\
          </div>\
          ';
          this.docModelToSchema();


    var positionerContainer = document.createElement("div");
    positionerContainer.id = "positionerContainer";
    document.body.appendChild(positionerContainer);

    positionerContainer.innerHTML =
      '<div id="docPositionerFull">\
      <img id="docPositionerFullImg"/></div>\
  ';


  var manualPositionsWindow = document.createElement("div");
  manualPositionsWindow.id = "manualPos";
  document.body.appendChild(manualPositionsWindow);

  manualPositionsWindow.innerHTML=
  '<div id = "inputFields" >\
  <table>\
  <tr><td><label id = "xPosLab" for="setPosX">XPosition </label></td>\
  <td><input id = "setPosX"></label></td>\
  </tr>\
  <tr><td><label id = "yPosLab" for="setPosY">YPosition</label></td>\
  <td><input id = "setPosY"></label></td>\
  </tr>\
  <tr><td><label id = "zPosLab" for="setPosZ">ZPosition</label></td>\
  <td><input id = "setPosZ"></label></td>\
  </tr>\
  <tr><td><label id = "xQuatLab" for="quatX">XQuaternion</label></td>\
  <td><input id = "quatX"></label></td>\
  </tr>\
  <tr><td><label id = "yQuatLab" for="quatY">YQuaternion</label></td>\
  <td><input id = "quatY"></label></td>\
  <tr><td><label id = "zQuatLab" for="quatZ">ZQuaternion</label></td>\
  <td><input id = "quatZ"></label></td>\
  </tr>\
  <tr><td><label id = "wQuatLab" for="quatW">WQuaternion</label></td>\
  <td><input id = "quatW"></label></td>\
  </tr>\
  </table>\
  </div>\
  <div id="docPositionerFullPanel">\
      <button id="docPositionerSave" type=button>Save</button>\
      <button id="moveDocument" type=button>Go to position</button>\
      <button id = "docPositionerCancel" type=button>Cancel</button>\
  </div>\
  ';

  }


this.activateCreateWindow = function activateCreateWindow(active){

  if (typeof active != 'undefined')
  {
      this.windowIsActive = active;
  }
  document.getElementById(this.contributeController.creationContainerId).style.display = active  ? "block" : "none ";
  document.getElementById('manualPos').style.display = active  ? "block" : "none ";
  document.getElementById('positionerContainer').style.display = active  ? "block" : "none ";


  this.contributeController.documentController.documentResearch.activateWindow(true);
  this.contributeController.documentController.documentBrowser.activateWindow(true);
}

this.activateManualPosition = function activateManualPosition(active){
  if (typeof active != 'undefined')
  {
      this.windowIsActive = active;
  }
  document.getElementById('manualPos').style.display = active  ? "block" : "none ";

}

this.cancelPosition = function cancelPosition(){
  this.contributeController.docPos = null;
  this.contributeController.docQuat = null;
  this.activateManualPosition(false);
  document.getElementById('docPositionerFull').style.display = "none ";
}

  // Display or hide this window
  this.activateWindow = function activateWindow(active)
  {
      if (typeof active != 'undefined')
      {
          this.windowIsActive = active;
      }
      document.getElementById('docBrowserWindow').style.display = active  ? "block" : "none ";


  }

  this.refresh = function refresh()
  {
      this.activateWindow(this.windowIsActive);
  }

  this.docModelToSchema = function docModelToSchema(){
    //only use the metadata
    var metadata = this.contributeController.documentController.documentModel.metadata;
    //schema has at least a file input
    var schemaType =
    {
      "type": "object",
      "properties": {
        "link":{}
      }
    }

    //options have at least a file input, that can be displayed to the user
    var optionsCreate = {
      "form": {
        "attributes":{
          "id":"creationForm"
        }
      },
      "fields":{
        "link":{
          "label":"Upload your file",
          "type":"file",
          "styled":true,
          "format":"uri",
          "id":"uploadedFile",
          "selectionHandler": function(files, data) {
              document.getElementById('docPositionerFullImg').src = data[0];
              this.myUploadedImage = data[0];
            }
          }
        }
      };

    for (var key in metadata) {
      var attribute = metadata[key]; //holds all metadata relative information

         //dynamic build the schema
          schemaType.properties[attribute['name']]={};
          optionsCreate.fields[attribute['name']] = {};
          optionsCreate.fields[attribute['name']]['id'] = attribute['creationID'];
          optionsCreate.fields[attribute['name']]['inputType'] = attribute['type'];
          if(attribute['optional'] == "false"){//this metadata is required in the creation process
            optionsCreate.fields[attribute['name']]['label'] = attribute['labelCreation'] + "* :";//start to show  field mandatory
          }
          else{
            optionsCreate.fields[attribute['name']]['label'] = attribute['labelCreation'];
          }

          optionsCreate.fields[attribute['name']]['name'] = attribute['name'];
          if(attribute['type'] == "enum"){
            optionsCreate.fields[attribute['name']]['type'] = 'select';
            schemaType.properties[attribute['name']]['enum'] = attribute['enum']
          }

    }

    //Create form using alpaca
    $("#creationWindow").alpaca({
         "schemaSource": schemaType,
         "options": optionsCreate
    });

  }

  this.updateCreationWindow = function updateCreationWindow(){
    document.getElementById('creationContainer').style.display ="block";
    this.contributeController.documentController.documentResearch.activateWindow(false);
    this.contributeController.documentController.documentBrowser.activateWindow(false);

  }


  this.showDocPositioner = function showDocPositioner(show){
    if(show){
      document.getElementById('docPositionerFull').style.display = "block";
      document.getElementById('manualPos').style.display = "block";
      document.getElementById('inputFields').style.display = "block";
    }
    else {
      document.getElementById('docPositionerFull').style.display = "none";
      document.getElementById('manualPos').style.display = "none";
      document.getElementById('inputFields').style.display = "none";
    }
    this.contributeController.documentShowPosition();
  }


  this.initialize();

  //Eventlisteners for buttons
  document.getElementById('docBrowserCreateButton').addEventListener('mousedown',
                                      this.updateCreationWindow.bind(this),false);
  document.getElementById('docCreation').addEventListener('mousedown',
    this.contributeController.documentCreation.bind(this.contributeController),false);
  document.getElementById('closeCreation').addEventListener('mousedown',
                                this.activateCreateWindow.bind(this,false),false);
  document.getElementById('documentPositioner').addEventListener('mousedown',
                                this.showDocPositioner.bind(this, true), false);

  document.getElementById('docPositionerSave').addEventListener('mousedown',
  this.contributeController.getVisualizationData.bind(this.contributeController), false);
  document.getElementById('moveDocument').addEventListener('mousedown',
        this.contributeController.moveDoc.bind(this.contributeController), false);
  document.getElementById('docPositionerCancel').addEventListener('mousedown',
                                    this.cancelPosition.bind(this,false), false);


}