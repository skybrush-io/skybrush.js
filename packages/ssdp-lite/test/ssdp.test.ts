import { EventEmitter } from 'node:events';
import SSDP from '../src';

const NOTIFY_ALIVE = [
  'NOTIFY * HTTP/1.1',
  'HOST: 239.255.255.250:1900',
  'NT: urn:test:device',
  'NTS: ssdp:alive',
  'USN: uuid:f40c2981-7329-40b7-8b04-27f187aecfb5::urn:test:device',
  '',
  '',
].join('\r\n');

const NOTIFY_BYEBYE = [
  'NOTIFY * HTTP/1.1',
  'NTS: ssdp:byebye',
  'USN: uuid:f40c2981-7329-40b7-8b04-27f187aecfb5',
  '',
  '',
].join('\r\n');

const RESPONSE = [
  'HTTP/1.1 200 OK',
  'CACHE-CONTROL: max-age=1800',
  'ST: urn:test:device',
  'USN: uuid:f40c2981-7329-40b7-8b04-27f187aecfb5',
  '',
  '',
].join('\r\n');

const rinfo = {
  address: '192.168.1.10',
  port: 12345,
  family: 'IPv4',
  size: 100,
};

function createInstance(): SSDP {
  return new SSDP();
}

describe('SSDP', () => {
  test('is an EventEmitter', () => {
    expect(createInstance()).toBeInstanceOf(EventEmitter);
  });

  test('getSSDPHeader() formats commands', () => {
    const ssdp = createInstance();

    const result = ssdp.getSSDPHeader('M-SEARCH', {
      HOST: '239.255.255.250:1900',
      ST: 'ssdp:all',
      MAN: '"ssdp:discover"',
      MX: 3,
    });

    expect(result).toBe(
      'M-SEARCH * HTTP/1.1\r\n' +
        'HOST: 239.255.255.250:1900\r\n' +
        'ST: ssdp:all\r\n' +
        'MAN: "ssdp:discover"\r\n' +
        'MX: 3\r\n' +
        '\r\n'
    );
  });

  test('getSSDPHeader() formats responses', () => {
    const ssdp = createInstance();

    const result = ssdp.getSSDPHeader('200 OK', { ST: 'x', EXT: '' }, true);

    expect(result).toBe('HTTP/1.1 200 OK\r\nST: x\r\nEXT: \r\n\r\n');
  });

  test('parses NOTIFY ssdp:alive messages', () => {
    const ssdp = createInstance();
    const handler = jest.fn();

    ssdp.on('advertise-alive', handler);
    ssdp.sock.emit('message', Buffer.from(NOTIFY_ALIVE), rinfo);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      HOST: '239.255.255.250:1900',
      NT: 'urn:test:device',
      NTS: 'ssdp:alive',
      USN: 'uuid:f40c2981-7329-40b7-8b04-27f187aecfb5::urn:test:device',
    });
  });

  test('parses NOTIFY ssdp:byebye messages', () => {
    const ssdp = createInstance();
    const handler = jest.fn();

    ssdp.on('advertise-bye', handler);
    ssdp.sock.emit('message', Buffer.from(NOTIFY_BYEBYE), rinfo);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      NTS: 'ssdp:byebye',
      USN: 'uuid:f40c2981-7329-40b7-8b04-27f187aecfb5',
    });
  });

  test('emits response messages with the sender information', () => {
    const ssdp = createInstance();
    const handler = jest.fn();

    ssdp.on('response', handler);
    ssdp.sock.emit('message', Buffer.from(RESPONSE), rinfo);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(RESPONSE, rinfo);
  });

  test('addUSN() composes the USN from the UDN and answers M-SEARCHes', () => {
    const ssdp = createInstance();
    const send = jest
      .spyOn(ssdp.sock, 'send')
      .mockImplementation((_msg, _offset, _length, _port, _address, cb) => {
        cb?.(null, 0);
      });

    ssdp.addUSN('upnp:rootdevice');
    ssdp.sock.emit(
      'message',
      Buffer.from(
        'M-SEARCH * HTTP/1.1\r\n' +
          'HOST: 239.255.255.250:1900\r\n' +
          'MAN: "ssdp:discover"\r\n' +
          'MX: 3\r\n' +
          'ST: upnp:rootdevice\r\n' +
          '\r\n'
      ),
      rinfo
    );

    expect(send).toHaveBeenCalledTimes(1);
    const [message, , , port, address] = send.mock.calls[0];
    expect(address).toBe('192.168.1.10');
    expect(port).toBe(12345);
    expect(message.toString()).toContain('HTTP/1.1 200 OK\r\n');
    expect(message.toString()).toContain(
      'USN: uuid:f40c2981-7329-40b7-8b04-27f187aecfb5::upnp:rootdevice\r\n'
    );
  });
});
