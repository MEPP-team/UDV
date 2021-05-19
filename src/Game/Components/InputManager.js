/** @format */

const Shared = require('../Shared/Shared');

//TODO CREATE class KeyState
const MOUSE_STATE_EVENTS = {
  MOUSE_UP: 'mouseup',
  MOUSE_DOWN: 'mousedown',
  MOUSE_MOVE: 'mousemove',
};

export class MouseState {
  constructor() {
    this.mouseMap = {};
    this.mouseEvent = {};
    this.dragging = false;
    this.listeners = [];
  }

  isDragging() {
    return this.dragging;
  }

  dispose() {
    this.listeners.forEach(function (l) {
      l.element.removeEventListener(l.id, l.cb);
    });
  }

  startListening(element) {
    for (let id in MOUSE_STATE_EVENTS) {
      this.listeners.push({
        element: element,
        cb: this.addEvent(element, MOUSE_STATE_EVENTS[id]),
        id: MOUSE_STATE_EVENTS[id],
      });
    }
  }

  addEvent(element, idEvent) {
    const _this = this;
    const listener = function (event) {
      if (idEvent === MOUSE_STATE_EVENTS.MOUSE_DOWN) {
        _this.dragging = true;
      } else if (idEvent === MOUSE_STATE_EVENTS.MOUSE_UP)
        _this.dragging = false;
      _this.mouseMap[idEvent] = true; //is trigger
      _this.mouseEvent[idEvent] = event;
    };
    element.addEventListener(idEvent, listener);
    this.mouseMap[idEvent] = false;

    return listener;
  }

  event(eventID) {
    return this.mouseEvent[eventID];
  }

  isTrigger(eventID) {
    return this.mouseMap[eventID];
  }

  reset() {
    //reset trigger mousemap
    for (let idEvent in this.mouseMap) {
      this.mouseMap[idEvent] = false;
    }
  }
}

export class InputManager {
  constructor() {
    //internal
    this.keyMap = {};
    this.keyCommands = {};
    this.mouseCommands = {};
    this.mouseState = new MouseState();
    //to know what command have been done yet (avoid doublon)
    this.commandsBuffer = {};

    //internal
    this.listeners = [];
    this.element = null;
    this.altKey = false;
  }

  listenKeys(keys) {
    const _this = this;
    keys.forEach(function (k) {
      _this.keyMap[k] = false;
    });
  }

  addKeyInput(key, eventID, cb) {
    window.addEventListener(eventID, function (event) {
      if (key == event.key) cb();
    });
  }

  addKeyCommand(commandID, keys, cb) {
    const _this = this;
    //init
    this.commandsBuffer[commandID] = false;
    keys.forEach(function (key) {
      if (_this.keyMap[key] != undefined)
        throw new Error(key, ' is already assign');
      _this.keyMap[key] = false;
      _this.keyCommands[key] = function () {
        if (_this.commandsBuffer[commandID]) {
          return null;
        }
        const cmd = cb();
        if (cmd) {
          _this.commandsBuffer[commandID] = true;
          return cmd;
        }
        return null;
      };
    });
  }

  addMouseCommand(eventID, cb) {
    this.mouseCommands[eventID] = cb; //cb must return a Command and take mouse as argument
  }

  startListening(element) {
    const _this = this;
    this.element = element;

    //update inputs state
    const keydown = function (event) {
      if (_this.keyMap[event.key] == false) {
        _this.keyMap[event.key] = true;
      }
      _this.altKey = event.altKey;
    };
    window.addEventListener('keydown', keydown);
    this.listeners.push({ element: window, cb: keydown, id: 'keydown' });

    const keyup = function (event) {
      if (_this.keyMap[event.key] == true) {
        _this.keyMap[event.key] = false;
      }
      _this.altKey = event.altKey;
    };
    window.addEventListener('keyup', keyup);
    this.listeners.push({ element: window, cb: keyup, id: 'keyup' });

    this.mouseState.startListening(element);
  }

  isPressed(key) {
    return this.keyMap[key];
  }

  dispose() {
    this.listeners.forEach(function (l) {
      l.element.removeEventListener(l.id, l.cb);
    });
    this.mouseState.dispose();
  }

  resetCommandsBuffer() {
    for (let id in this.commandsBuffer) {
      this.commandsBuffer[id] = false;
    }
  }

  isAltKey() {
    return this.altKey;
  }

  computeCommands() {
    const result = [];
    for (let id in this.keyCommands) {
      if (this.keyMap[id]) {
        const cmd = this.keyCommands[id]();
        if (cmd) result.push(cmd);
      }
    }

    for (let eventID in this.mouseCommands) {
      if (this.mouseState.isTrigger(eventID)) {
        const cmd = this.mouseCommands[eventID].apply(this.mouseState, []);
        if (cmd) result.push(cmd);
      }
    }

    this.mouseState.reset();
    this.resetCommandsBuffer();

    return result;
  }

  sendCommandsToServer(websocketService) {
    if (!websocketService) throw new Error('no websocket service');

    const cmds = this.computeCommands();
    const cmdsJSON = [];
    cmds.forEach(function (cmd) {
      cmdsJSON.push(cmd.toJSON());
    });
    websocketService.emit(
      Shared.Components.Data.WEBSOCKET.MSG_TYPES.COMMANDS,
      cmdsJSON
    );
  }
}
