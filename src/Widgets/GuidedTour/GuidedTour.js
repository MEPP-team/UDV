//Components
import { Window } from '../../Components/GUI/js/Window';
import '../../Components/GUI/css/window.css';

import './GuidedTour.css'

/**
 * Class: GuidedTour
 * Description :
 * The GuidedTour is an object handling the guidedtour view
 *
 *
 * @param { HTML DOM Element object } guidedTourContainer
 * @param { guidedTourController } guidedTourController : instance of GuidedTourController
 *
//=============================================================================*/
export class GuidedTour extends Window {

  constructor(guidedTourController) {
    super('guidedTour', 'Guided Tour', false)
    this.guidedTourController = guidedTourController;

    this.tourIndex = 1; //current guided tour. Default is 1 (start)

    this.stepIndex = 1; //current step of the guidedtour. Defautt is 1 (start)

    // boolean to control the state of the guided tour window (open/closed)
    this.guidedTourWindowIsActive = true;

    this.isStart = true;

    this.currentTour = null; //current guided tour
    this.currentStep = null; //current step of the current guided tour

    //instance of document browser
    this.documentBrowser = this.guidedTourController.browser;

    //update browser view
    var guidedTourText2 = document.createElement('div');
    guidedTourText2.id = 'guidedTourText2';
    //document.getElementById('docBrowserWindow').appendChild(guidedTourText2);
  }

  get innerContentHtml() {
    return `
    <div id="guidedTourWindow">
    <div id="guidedTourTitle"></div>
    <div id="guidedTourStepTitle"></div>
    <div id="guidedTourText1"></div>
    <div id="guidedTourDocPreview"><img id="guidedTourDocPreviewImg"/></div>
    <div id="tourCpt"></div>
    <button id="guidedTourNextStepButton" type=button>⇨</button>
    <button id="guidedTourNextTourButton" type=button>⇨</button>
    <button id="guidedTourPreviousStepButton" type=button>⇦</button>
    <button id="guidedTourPreviousTourButton" type=button>⇦</button>
    <button id="guidedTourExitButton" type=button>EXIT</button>
    <button id="guidedTourStartButton" type=button>START</button>
    </div>
    `;
  }

  windowCreated() {
    this.initializeButtons();
    this.startGuidedTourMode();
    this.window.style.width = '440px';
    this.window.style.height = '470px';
    this.window.style.top = '375px';
    this.window.style.left = '10px';
    this.innerContent.style.height = '100%';
  }

  // hide or show the guided tour window
  //=============================================================================
  toggleGuidedTourWindow(){

    document.getElementById('guidedTourWindow').style.display =
                                this.guidedTourWindowIsActive ? "block" : "none";
    this.guidedTourWindowIsActive = this.guidedTourWindowIsActive ? false : true;

    if(this.isStart){
      this.startGuidedTourMode();
      this.isStart = false;
      this.guidedTourController.toggleGuidedTourButtons(true);
    }
  }

  //get all available guided tour from the database
  startGuidedTourMode(){
    this.guidedTourController.getGuidedTours().then(() => {
      this.previewTour();
    });
  }

  /**
   * Initialize the preview of the guided tour
   */
  //=============================================================================
  previewTour(){
    document.getElementById('tourCpt').innerHTML = "Tour: "
      + this.tourIndex + " out of " + this.guidedTourController.guidedTours.length;
    document.getElementById("guidedTourPreviousTourButton").style.display = "block";
    document.getElementById("guidedTourNextTourButton").style.display = "block";
    // for the demo, until we have more than one finished guided tour
    // we can prevent user from changing tour by hiding the buttons
    if(this.guidedTourController.preventUserFromChangingTour){
        document.getElementById("guidedTourPreviousTourButton").style.display = "none";
        document.getElementById("guidedTourNextTourButton").style.display = "none";
    }

    document.getElementById("guidedTourPreviousStepButton").style.display = "none";
    document.getElementById("guidedTourNextStepButton").style.display = "none";
    document.getElementById("guidedTourExitButton").style.display = "none";
    //document.getElementById("guidedTourText2").style.display = "none";
    document.getElementById("guidedTourStartButton").style.display = "block";

    let currentTour = this.guidedTourController.getCurrentTour();
    document.getElementById('guidedTourTitle').innerHTML = 
                                  currentTour ? currentTour.name
                                              : 'No guided tour';
    document.getElementById('guidedTourText1').innerHTML =
                                  currentTour ? currentTour.description
                                              : 'Please add guided tours';
    document.getElementById("guidedTourText1").style.height = "45%";
    document.getElementById("guidedTourStepTitle").innerHTML = null;

  }


  // update step with current step data
  //=============================================================================
  updateStep(){

    this.currentStep = this.guidedTourController.getCurrentStep();
    this.documentBrowser.currentMetadata =
                    this.guidedTourController.getCurrentStep().document;
    this.documentBrowser.currentDoc = this.guidedTourController.getCurrentStep().document;
    this.documentBrowser.updateBrowser();
    document.getElementById("guidedTourText1").innerHTML = this.currentStep.text1;
    document.getElementById('guidedTourStepTitle').innerHTML = this.currentStep.title;
    this.documentBrowser.focusOnDoc();
  }

  //start guided tour
  //=============================================================================
  startGuidedTour(){

    if(this.guidedTourController.getCurrentTour().extendedDocs.length > 0){
      this.tourIndex = 1;
      this.stepIndex = 1;
      this.updateStep();
      // setup the display (hide & show elements)
      this.guidedTourController.toggleGuidedTourButtons(false);
      document.getElementById("guidedTourDocPreviewImg").style.display = "none";
      document.getElementById("guidedTourText1").style.height = "60%";
      document.getElementById('tourCpt').style.display = "none";
    }
    else {
      alert('This guided tour is empty'); //should never happen. If a guided tour
                                          //doesn't have steps, then it is not a guided tour
    }
  };

  // Quit current guided tour
  //=============================================================================
  exitGuidedTour(){
      this.guidedTourController.reset();
  };

  /**
   * Update guided tour preview by clicking on "guidedTourNextTourButton" button
   */
  //=============================================================================
  nextTour(){
    if(this.tourIndex < this.guidedTourController.guidedTours.length){
      this.guidedTourController.getNextTour();
      this.tourIndex ++;
      this.previewTour();
    }
  }

  /**
   * Update guided tour preview by clicking on "guidedTourPreviousTourButton" button
   */
  //=============================================================================
  previousTour(){
    this.guidedTourController.getPreviousTour();
    if(this.tourIndex > 1 ){
      this.tourIndex --;
    }
    this.previewTour();
  }

  /**
   * Update step by clicking on "guidedTourNextStepButton" button
   */
  //=============================================================================
  nextStep(){

    if(this.stepIndex < this.guidedTourController.getCurrentTour().extendedDocs.length ){
      this.stepIndex ++;
      this.guidedTourController.getNextStep();
          this.updateStep();
    }

  }

  /**
   * Update step by clicking on "guidedTourPreviousStepButton" button
   */
  //=============================================================================
  previousStep(){

    if( this.stepIndex > 1 ){
      this.guidedTourController.getPreviousStep();
      this.stepIndex --;
      this.updateStep();
    }
  }

  // event listeners (buttons)
  initializeButtons() {
    document.getElementById("guidedTourNextTourButton").addEventListener('mousedown',
                                                  this.nextTour.bind(this),false);
    document.getElementById("guidedTourPreviousTourButton").addEventListener('mousedown',
                                              this.previousTour.bind(this),false);
    document.getElementById("guidedTourStartButton").addEventListener('mousedown',
                                          this.startGuidedTour.bind(this),false);
    document.getElementById("guidedTourNextStepButton").addEventListener('mousedown',
                                                  this.nextStep.bind(this),false);
    document.getElementById("guidedTourPreviousStepButton").addEventListener('mousedown',
                                              this.previousStep.bind(this),false);
    document.getElementById("guidedTourExitButton").addEventListener('mousedown',
                                            this.exitGuidedTour.bind(this),false);
  }

}
