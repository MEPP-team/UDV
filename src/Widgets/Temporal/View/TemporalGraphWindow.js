//Components
import { Window } from "../../../Components/GUI/js/Window";

import { NetworkManager } from "./NetworkManager";
import './TemporalWindow.css';

/**
 * Constructor for TemporalWindow Class
 * Handles the GUI part enabling the user to specify the chosen "time" (moment or
 * date) of observation for displayal of the (3D) scene.
 * Note that it is not the Temporal View's responsability to
 * alter/modify/update the scene according to the user specified moment (but
 * only to trigger the possible hook-ups).
 * This View represents a timestamp with the Moment.js library.
 * @param refreshCallback : callback to be called when the time has changed.
 * @param options : optional parameters (min time, max time and current time)
 */
export class TemporalGraphWindow extends Window {
    constructor(refreshCallback, options = {}) {
    // option : getAsynchronousData
        super('temporal', 'Temporal Graph Navigation', false);

        this.refreshCallback = refreshCallback;

        // graph
        this.networkManager = new NetworkManager();
        this.networkManager.option=options.viewOptions;
        this.networkManager.getAsynchronousData = options.temporalWindow.getAsynchronousData;
    }

    get innerContentHtml() {
        return /*html*/`
            <div id="temporalWindow">
            <div id="mynetwork"></div>
            </div>
        `;
    }

    windowCreated() {
        // Magical code to center an absolute positionned window
        this.window.style.setProperty('left', '0');
        this.window.style.setProperty('right', '0');
        this.window.style.setProperty('margin-left', 'auto');
        this.window.style.setProperty('margin-right', 'auto');
        // Put it at the bottom of the page
        this.window.style.setProperty('top', 'unset');
        this.window.style.setProperty('bottom', '0');
        this.window.style.setProperty('margin-bottom', 'auto');
        // Window size and center text
        this.window.style.setProperty('width', '700px');
        this.window.style.setProperty('height', '215px');
//        this.window.style.setProperty('height', '115px');
        this.window.style.setProperty('text-align', 'center');

        // Add graph
        this.networkManager.init();
        this.networkManager.add_event((param)=>{this.changeTime(param)});
    }


    // change the current date and sync the temporal version to this new date
    changeTime(time) {
        this.currentTime = time;

        // Eventually inform who it may concern (e.g. an associated iTowns layer)
        // that the currentTime has changed:
        this.refreshCallback(this.currentTime);
    }

}
