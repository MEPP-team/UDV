import { Window } from "./Window.js";

const BASE_Z_INDEX = 100;

/**
 * Class used to manage windows. Every window is registered into the manager
 * 
 */
class WindowManager {
  constructor() {
    /**
     * List of all registered windows.
     * 
     * @member {Window[]} windows
     */
    this.windows = [];

    this.createdWindows = {};

    this.highestZIndex = BASE_Z_INDEX;
  }

  /**
   * Registers a window.
   * 
   * @param {Window} window 
   */
  registerWindow(window) {
    this.windows.push(window);
    window.addEventListener(Window.EVENT_CREATED, () => {
      this.createdWindows[window.name] = true;
      window.window.style.zIndex = this.newTopIndex();
      window.window.addEventListener('mousedown', () => {
        if (window.isCreated
            && window.window.style.zIndex < this.highestZIndex) {
          window.window.style.zIndex = this.newTopIndex();
        }
      });
    });
    window.addEventListener(Window.EVENT_DESTROYED, () => {
      delete this.createdWindows[window.name];
      if (Object.keys(this.createdWindows).length === 0) {
        this.highestZIndex = BASE_Z_INDEX;
      }
    });
  }

  newTopIndex() {
    this.highestZIndex += 1;
    return this.highestZIndex;
  }
}

export let windowManager = new WindowManager();