import { EventSender } from '../Events/EventSender.js';

/**
 * Represents a basic view for a module. Extending this class is not mandatory to write
 * a module, but is strongly advised as it simplifies the integration is demos.
 */
export class ModuleView extends EventSender {
    /**
     * Creates a new ModuleView.
     */
    constructor() {
        super();

        /**
         * Represents the parent HTML element of this view. Must be defined
         * by the user of the view
         * 
         * @member {HTMLElement}
         */
        this.parentElement = null;

        this.registerEvent(ModuleView.EVENT_ENABLED);
        this.registerEvent(ModuleView.EVENT_DISABLED);
    }

    ///////// Overideable methods
    // These methods should be overriden by the implementing class
    // By default, they do nothing. They are supposed to enable
    // or disable the view. (Can be done by destroying / creating, or
    // by hiding, showing).
    // These methods should never be called manually as they do not
    // send appropriate events.
    /**
     * Must be overriden by the implementing class. Supposedly enables the view.
     * @abstract
     */
    async enableView() { }
    /**
     * Must be overriden by the implementing class. Supposedly disables the view.
     * @abstract
     */
    async disableView() { }

    ///////// Do not override
    // These methods are the public methods called to destroy or
    // create the view.
    /**
     * Enables the view (depends on the implementation).
     * 
     * Sends a EVENT_ENABLED event once the view is enabled.
     * 
     * @async
     */
    async enable() {
        await this.enableView();
        this.sendEvent(ModuleView.EVENT_ENABLED);
    }

    /**
     * Disables the view (depends on the implementation).
     * 
     * Sends a EVENT_DISABLED event once the view is disabled.
     * 
     * @async
     */
    async disable() {
        await this.disableView();
        this.sendEvent(ModuleView.EVENT_DISABLED);
    }

    ///////// Events
    // Events called when enabling / disabling the view
    /**
     * Event sent when the view is enabled
     */
    static get EVENT_ENABLED() {
        return 'MODULE_VIEW_ENABLED';
    }

    /**
     * Event sent when the view is disabled
     */
    static get EVENT_DISABLED() {
        return 'MODULE_VIEW_DISABLED';
    }
}