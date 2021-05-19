/**
 * A simple class to manage events. Represents an object that can send events.
 * Any part of the code can listen to these events. They can either listen to
 * specific events, or to all events.
 */
export class EventSender {
    constructor() {
        /**
         * The listeners attached to a specific event.
         * 
         * @type {Object.<string, Array<(data: any) => any>>}
         */
        this.eventListeners = {};
        /**
         * The listeners attached to no particular event. They will receive
         * all notifications.
         * 
         * @type {Array<(data: any) => any>}
         */
        this.allEventsListeners = [];
    }

    /**
     * Registers an event. Should be called by the implementing class to
     * specify its own events.
     * @param event The event to register. Can be of any type. The class will be
     *              able to send only the events that it has registered.
     */
    registerEvent(event) {
        this.eventListeners[event] = [];
    }

    /**
     * Registers an event listener attached to a specific event. The `action`
     * function will be called only when `event` is fired.
     * 
     * @param event The event to listen to.
     * @param {(data: any)} action The function to call.
     */
    addEventListener(event, action) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(action);
        } else {
            throw `This event is not defined by this listener : ${event}`;
        }
    }

    /**
     * Registers an event listener attached to no specific event. The `action`
     * function will be called when any event is fired.
     * 
     * @param {(event: any, data: any)} action The function to call.
     */
    addListener(action) {
        if (typeof(action) !== 'function') {
            throw 'A listener must be a function';
        }
        this.allEventsListeners.push(action);
    }

    /**
     * Sends an event to the listeners. `event` must be first registers through the `registerEvent`
     * method. An argument can be passed but is optional.
     * 
     * @param event The event to fire. Must be first registered. 
     * @param data The optional data to pass as parameter.
     */
    async sendEvent(event, data = null) {
        let listeners = this.eventListeners[event];
        if (!!listeners) {
            for (let action of listeners) {
                action(data);
            }
            for (let action of this.allEventsListeners) {
                action(event, data);
            }
        } else {
            throw `This event must be registered before being sent : ${event}`;
        }
    }

    /**
     * Removes a specific event listener.
     * 
     * @param {(data: any) => any} action The event listener to remove. This
     * should be the same reference that was used to register it.
     */
    removeEventListener(action) {
        for (let eventListeners of Object.values(this.eventListeners)) {
            let index = eventListeners.findIndex((list) => action === list);
            if (index >= 0) {
                eventListeners.splice(index, 1);
            }
        }

        let index = this.allEventsListeners.findIndex((list) => action === list);
        if (index >= 0) {
            this.allEventsListeners.splice(index, 1);
        }
    }
}