//Components
import { ModuleView } from '../../../Components/ModuleView/ModuleView.js';

import { TemporalGraphWindow } from './TemporalGraphWindow.js';
import { TemporalSliderWindow } from './TemporalSliderWindow.js';
import { EnumTemporalWindow } from './EnumWindows.js';

/**
 * The view entrypoint. Initialize the correct window depending on the
 * configuration and hook up the callbacks from the view model to this window.
 */
export class TemporalView extends ModuleView {
  constructor(provider, temporalOptions) {
    super();

    this.provider = provider;

    // ******* Temporal window
    // Declare a callback to update this.currentTime when it is changed
    // by the user in the temporalWindow
    this.currentTime = temporalOptions.currentTime;

    function currentTimeUpdated(newDate) {
        this.currentTime = Number(newDate);
        this.provider.currentTime = this.currentTime; // TODO: verify that the 
        // flow is good with MVVM 
        this.provider.changeVisibleTilesStates();
    }
    const refreshCallback = currentTimeUpdated.bind(this);

    // Callback to get data asynchronously from the tileset.json
    function getAsynchronousData(){
            let versions = this.temporalExtension.temporal_tileset.temporalVersions.versions;
            let versionTransitions = this.temporalExtension.temporal_tileset.versionTransitions;
            return [versions, versionTransitions]
        }

    // Select the window type:
    switch (temporalOptions.view) {
      case EnumTemporalWindow.SLIDERWINDOW :
          this.temporalWindow = new TemporalSliderWindow(refreshCallback, temporalOptions);
          break;
      case EnumTemporalWindow.GRAPHWINDOW :
          temporalOptions.getAsynchronousData = getAsynchronousData.bind(this);
          this.temporalWindow = new TemporalGraphWindow(refreshCallback, temporalOptions);
          break;
      }
  }

  /////////////////
  ///// MODULE VIEW
  enableView() {
    this.temporalWindow.appendTo(this.parentElement);
  }

  disableView() {
    this.temporalWindow.dispose();
  }
}