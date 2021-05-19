/**
 * Object send from client to server and vice versa
 *
 * @format
 */

const CommandModule = class Command {
  constructor(json) {
    if (!json) throw new Error('no json');
    this.type = json.type;
    this.userID = json.userID;
    this.avatarID = json.avatarID;
    this.data = json.data;
  }

  getData() {
    return this.data;
  }

  getType() {
    return this.type;
  }

  setAvatarID(id) {
    this.avatarID = id;
  }

  getAvatarID() {
    return this.avatarID;
  }

  setUserID(userID) {
    this.userID = userID;
  }

  getUserID() {
    return this.userID;
  }

  toJSON() {
    
    return {
      type: this.type,
      avatarID: this.avatarID,
      userID: this.userID,
      data: this.data,
    };
  }
};

CommandModule.TYPE = {
  RUN: 'run',
  MOVE_FORWARD: 'move_forward',
  MOVE_BACKWARD: 'move_backward',
  MOVE_LEFT: 'move_left',
  MOVE_RIGHT: 'move_right',
  ROTATE: 'rotate',
  MOVE_TO: 'move_to',
};

module.exports = CommandModule;
