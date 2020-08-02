'use strict';

const createSocket      = require('dgram').createSocket;
const EventEmitter      = require('events').EventEmitter;

class Transport extends EventEmitter {
  constructor(settings) {
    super();
    this._settings = settings;
    this._server = createSocket({type: 'udp4', reuseAddr: settings.reuseAddr});
    this._server.on('message', (msg, rinfo) => this.emit('message', msg, rinfo.address));
    this._server.on('error', (err) => {
        if(err.message.includes('bind') || err.message.includes('EADDRINUSE')){
            console.log('Error, failed to bind bacnet port',err);
            throw(err);
        }
        this.emit('message', err);
    });
  }

  getBroadcastAddress() {
    return this._settings.broadcastAddress;
  }

  getMaxPayload() {
    return 1482;
  }

  send(buffer, offset, receiver) {
    this._server.send(buffer, 0, offset, this._settings.dstPort, receiver);
  }

  open() {
    this._server.bind(this._settings.port, this._settings.interface, () => {
      this._server.setBroadcast(true);
    });
  }

  close() {
    this._server.close();
  }
}
module.exports = Transport;
