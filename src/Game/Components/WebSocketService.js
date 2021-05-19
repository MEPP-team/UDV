/** @format */

/**
 * Handle a WebSocket communication client side with socket.io with server hosting the app
 */

import io from 'socket.io-client';

export class WebSocketService {
  constructor() {
    this.socket = null;
  }
  connectToServer() {
    //protocol
    const socketProtocol = window.location.protocol.includes('https')
      ? 'wss'
      : 'ws';

    //instantiate socket and connect to the server serving index.html
    this.socket = io(`${socketProtocol}://${window.location.host}`, {
      reconnection: false,
      secure: true,
    });

    this.on('connect', () => {
      console.log('Connected to server!');
    });

    this.on('disconnect', () => {
      console.log('Disconnected from server.');
    });
  }

  on(event, callback) {
    this.socket.on(event, callback);
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }
}
