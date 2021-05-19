/** @format */
import WorldState from '../Shared/WorldState';

export class WorldStateInterpolator {
  constructor(config) {
    this.config = config;

    //internal
    this.states = [];
    this.gameStart = 0;
    this.firstServerTimestamp = 0;

    //DEBUG
    this.lastTimeState = 0;
  }

  onFirstState(state) {
    this.firstServerTimestamp = state.getTimestamp();
    this.gameStart = Date.now();

    this.onNewState(state);
  }

  getDelay() {
    if (this.config && this.config.renderDelay) return this.config.renderDelay;
    return 0;
  }

  onNewState(state) {
    if (!state) {
      throw new Error('no state');
    }

    //DEBUG
    let now = Date.now();
    let dState = now - this.lastTimeState;
    this.lastTimeState = now;
    // console.log('state received last one was ', dState, ' ms ago');
    if (dState > this.getDelay()) console.warn('Server delay');

    this.states.push(state);

    // Keep only one worldstate before the current server time
    const index = this.computeIndexBaseState();
    if (index > 0) {
      this.states.splice(0, index);
    }
  }

  onNewDiff(diff) {
    let last = this.getLastStateReceived();
    if (!last) throw new Error('no last state');
    let newState = last.add(diff);
    this.onNewState(newState);
  }

  getLastStateReceived() {
    return this.states[this.states.length - 1];
  }

  getCurrentState() {
    if (!this.firstServerTimestamp) {
      return null;
    }

    const index = this.computeIndexBaseState();
    const serverTime = this.computeCurrentServerTime();

    // If base is the most recent update we have, use its state.
    // Otherwise, interpolate between its state and the state of (base + 1).
    if (index < 0 || index === this.states.length - 1) {
      // console.log('Last state !!');
      return this.getLastStateReceived();
    } else {
      const baseState = this.states[index];
      const nextState = this.states[index + 1];
      const ratio =
        (serverTime - baseState.getTimestamp()) /
        (nextState.getTimestamp() - baseState.getTimestamp());
      return WorldState.interpolate(baseState, nextState, ratio);
    }
  }

  computeCurrentServerTime() {
    return (
      this.firstServerTimestamp + Date.now() - this.gameStart - this.getDelay()
    );
  }

  //return the index of the first worldstate before server time
  computeIndexBaseState() {
    const serverTime = this.computeCurrentServerTime();
    for (let i = this.states.length - 1; i >= 0; i--) {
      if (this.states[i].getTimestamp() <= serverTime) {
        return i;
      }
    }
    return -1;
  }
}
