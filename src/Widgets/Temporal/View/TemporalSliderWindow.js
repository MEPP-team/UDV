//Components
import { Window } from "../../../Components/GUI/js/Window";

import './TemporalWindow.css';

/**
 * Handles the GUI part enabling the user to specify the chosen "time" (year) 
 * of observation for displayal of the (3D) scene.
 * Note that it is not the Temporal View's responsability to
 * alter/modify/update the scene according to the user specified moment (but
 * only to trigger the possible hook-ups).
 * @param refreshCallback : callback to be called when the time has changed.
 * @param options : optional parameters (min time, max time and current time)
 */
export class TemporalSliderWindow extends Window {
    constructor(refreshCallback, options = {}) {
        super('temporal', 'Temporal Navigation', false);

        // Minimum and maximum times that can be displayed by this occurence
        this.minTime = options.minTime || 2009;
        this.maxTime = options.maxTime || 2015;

        // The currently selected timestamp
        this.currentTime = options.currentTime || 2009;

        // The timestep used to increment or decrement time with the slide buttons.
        // Note that timeStep is a "duration" as opposed to a timestamp.
        this.timeStep = options.timeStep || 1;

        this.refreshCallback = refreshCallback;
    }

    get innerContentHtml() {
        return /*html*/`
            <div id="temporalWindow">
            <div id="timeSliderMinDate">${this.minTime}</div>
            <div id="timeSliderMaxDate">${this.maxTime}</div>
            <input type="text" id="timeSliderValue" value=${this.currentTime}>
            <input  id="timeSlider" type="range" min=${this.minTime} max=${this.maxTime}
                    value=${this.currentTime} step=${this.timeStep}>
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
        this.window.style.setProperty('bottom', '10px');
        this.window.style.setProperty('margin-bottom', 'auto');
        // Window size and center text
        this.window.style.setProperty('width', '700px');
        this.window.style.setProperty('height', '115px');
        this.window.style.setProperty('text-align', 'center');

        // Hook up the callbacks
        document.getElementById('timeSliderValue').addEventListener(
            'input', this.timeSelection.bind(this), false);
        document.getElementById('timeSlider').addEventListener(
            'input', this.timeSelectionSlider.bind(this), false);
    }

    // Call back on new user input with the date selector
    timeSelection() {
        this.currentTime = document.getElementById('timeSliderValue').value.toString();
        document.getElementById('timeSlider').value = this.currentTime;
        // Eventually inform who it may concern (e.g. an associated iTowns layer)
        // that the currentTime has changed:
        this.refreshCallback(this.currentTime);
    }

    // Call back on new user input with the time slider
    timeSelectionSlider()  {
        this.currentTime = document.getElementById('timeSlider').value.toString();
        document.getElementById('timeSliderValue').value = this.currentTime;
        // Eventually inform who it may concern (e.g. an associated iTowns layer)
        // that the currentTime has changed:
        this.refreshCallback(this.currentTime);
    }
}
