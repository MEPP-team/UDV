import { CreateDocument }  from './CreateDocument.js';
import "./Contribute.css";
import "./creation.css";
import { MAIN_LOOP_EVENTS } from 'itowns';

export function ContributeController(documentController){

  this.documentController = documentController;

  this.documentCreate;
  this.creationContainerId = "creationContainer"; //create view

  //url to create a document
  this.url = this.documentController.url + this.documentController.serverModel.add;

  this.newDocData = null; //newly created document's data
  this.formData ; //document's static metadata
  this.docPos = null; //document's position
  this.docQuat =  null; //document's quaternion
  this.chosenPosition =  new THREE.Vector3();  //manual document's position
  this.chosenQuaternion =  new THREE.Quaternion(); //manual document's quaternion

  this.validPosition = true;

  this.initialize = function initialize(){

    var creationContainer = document.createElement("div");
    creationContainer.id = this.creationContainerId;
    document.body.appendChild(creationContainer);
    this.documentCreate = new CreateDocument(creationContainer, this);
  }

  /**
   * Gets the document's position that has been chosen by user.
   */
  //=============================================================================
  this.getVisualizationData = function getVisualizationData(){
    this.docPos = new THREE.Vector3(document.getElementById("setPosX").value,
                                    document.getElementById("setPosY").value,
                                    document.getElementById("setPosZ").value
                                                                            );
    this.docQuat = new THREE.Quaternion(document.getElementById("quatX").value,
                                        document.getElementById("quatY").value,
                                        document.getElementById("quatZ").value,
                                        document.getElementById("quatW").value
                                                                          );
    this.documentCreate.showDocPositioner();

  }

  /**
   * Gets the current visualization data set by the user and
   *  moves camera to this position
   */
  //=============================================================================
  this.moveDoc = function moveDoc(){
    this.chosenPosition.x = document.getElementById("setPosX").value;
    this.chosenPosition.y = document.getElementById("setPosY").value;
    this.chosenPosition.z = document.getElementById("setPosZ").value;
    this.chosenQuaternion.x = document.getElementById("quatX").value;
    this.chosenQuaternion.y = document.getElementById("quatY").value;
    this.chosenQuaternion.z = document.getElementById("quatZ").value;
    this.chosenQuaternion.w = document.getElementById("quatW").value;
    this.documentController.controls.initiateTravel(this.chosenPosition,"auto",
                                                    this.chosenQuaternion,true);
  }

  /**
  * Colors the form fields if value is not set
  */
  //=============================================================================
  this.colorField = function colorField(id, color){
    if(color == true){
    document.getElementById(id).style.border = "1px solid red";
  }
  else {
    document.getElementById(id).style.border = "1px solid white";
    }
  }

  /**
   * Checks if visualization data is provided
   */
  //=============================================================================
  this.visuDataVerification = function visuDataVerification(){
    if(this.docPos == null || this.docQuat == null){
      this.validPosition = false;
      alert('Please chose document position and save');
      this.documentCreate.showDocPositioner(false);
    }
    else {
      this.validPosition = true;
    }
    return this.validPosition;
  }


  /**
   * Verifies form data
   */
  //=============================================================================
  this.formDataVerification = function formDataVerification(){
    var dataIsValid = true;
    this.formData = new FormData(document.getElementById('creationForm'));
    this.newDocData = this.formData;
    //var txt ="Please provide "; //error message if data unvalid

    for (var pair of this.formData.entries() ){

      var val = pair[0];
      if( val != "link"){ //is not file filed
        var attr = this.documentController.documentModel.metadata[val];
        if( attr['optional'] == 'false'){//is mandatory
          if(pair[1] == ""){  //but not provided
          var id = "create_"+pair[0];
          console.log('coucu')
          this.colorField(id, true);
          dataIsValid = false;
        }
        if(pair[1] != ""){
          var id = "create_"+pair[0];
          this.colorField(id, false);
        }
      }
      else{ //is file
        if (pair[1] == ""){ //no file provided
          dataIsValid = false;
        }
      }
    }
  }
    if(!dataIsValid){
    console.log('not valid')
  }
  return dataIsValid;
}

/**
  Post document if data is OK, reset all data to prepare next document creation
 */
//=============================================================================
  this.documentCreation = function documentCreation(){

    if (this.formDataVerification() ==true & this.visuDataVerification() == true){
      //add visualizationdata
      this.newDocData.append("positionX", this.docPos.x);
      this.newDocData.append("positionY", this.docPos.y);
      this.newDocData.append("positionZ", this.docPos.z);
      this.newDocData.append("quaternionX",this.docQuat.x);
      this.newDocData.append("quaternionY",this.docQuat.y);
      this.newDocData.append("quaternionZ",this.docQuat.z);
      this.newDocData.append("quaternionW",this.docQuat.w);
      this.newDocData.append("billboardX", this.docQuat.y);
}
      //post document
      //this.addDocument(function(){});
      //reset formular
      this.formData = new FormData(document.getElementById('creationForm'));


      /*$("#creationForm").get(0).reset();
      for (var pair of this.formData.entries() ){
        var id = "create_"+pair[0];
        console.log(pair[0] +":" + pair[1])
        if(id != 'create_link'){
          this.colorField(id, false);
        }
      }
      //reset position
      this.newDocData = new FormData();
      this.docPos = null;
      this.docQuat = null;
    }

    else {
      alert('Document could not be created')
    }*/
  }






  /**
   * Real time display of camera position ( = document position in overlay)
   */
  //=============================================================================
  this.documentShowPosition = function documentShowPosition(){

    var cam = this.documentController.view.camera.camera3D;
    var position = cam.position;
    var quaternion = cam.quaternion;
    document.getElementById("setPosX").value = position.x;
    document.getElementById("setPosY").value = position.y;
    document.getElementById("setPosZ").value = position.z;
    document.getElementById("quatX").value = quaternion.x;
    document.getElementById("quatY").value = quaternion.y;
    document.getElementById("quatZ").value = quaternion.z;
    document.getElementById("quatW").value = quaternion.w;

  }

  //POST document
  this.addDocument = function addDocument(callback){
    //check if visualizationdata has been given
    var req = new XMLHttpRequest();
    req.open("POST", this.url);
    req.addEventListener("load", function () {
      if (req.status >= 200 && req.status < 400) {
        console.log(req.status)
        //update creation status
        callback(req.responseText);
        alert('Your document was sucessfuly uploaded');
      }
      else {
        console.error(req.status + " " + req.statusText + " " + this.url);
      }
        });
        req.addEventListener("error", function () {
          console.error("Network error with url: " + url);
        });
        req.send(this.newDocData);

  }

    // itowns framerequester : will regularly call this.updateCamPos()
  this.documentController.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
                                                  this.documentShowPosition.bind(this) );

  this.initialize();

}