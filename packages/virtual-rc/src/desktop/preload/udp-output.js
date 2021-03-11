const dgram = require('dgram');
const { MAX_RC_CHANNEL_COUNT } = require('../../constants');

class UdpOutput {
  constructor() {
    this._socket = dgram.createSocket('udp4');
    this._buffer = Buffer.alloc(MAX_RC_CHANNEL_COUNT * 2);
  }

  _encode(channels) {
    let offset = 0;
    for (const value of channels) {
      this._buffer.writeInt16LE(value, offset);
      offset += 2;
    }

    // ArduCopter allows us to send 8 or 16 channels only, so fill the rest
    // with zeros
    if (channels.length < 8) {
      while (offset < 16) {
        this._buffer.writeInt16LE(0, offset);
        offset += 2;
      }
    } else if (channels.length > 8 && channels.length < 16) {
      while (offset < 16) {
        this._buffer.writeInt16LE(0, offset);
        offset += 2;
      }
    }

    return offset;
  }

  send(channels) {
    const length = this._encode(channels);
    this._socket.send(this._buffer, 0, length, 5501, '127.0.0.1');
  }
}

module.exports = () => new UdpOutput();