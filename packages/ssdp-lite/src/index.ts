/**
 * SSDP client and server library.
 *
 * TypeScript port of `node-ssdp-lite` (itself a fork of `node-ssdp` with the
 * logging dependency removed). Behaviour is intended to be identical to the
 * original; the only structural change is that the old `prototype`-based
 * "class" is now a proper ES2015+ class.
 *
 * @see https://github.com/sweetpi/node-ssdp-lite
 */

import { createSocket, type RemoteInfo, type Socket } from 'node:dgram';
import { lookup } from 'node:dns';
import { EventEmitter } from 'node:events';
import { type AddressInfo } from 'node:net';
import { hostname } from 'node:os';

const HTTP_HEADER = /HTTP\/\d{1}\.\d{1} \d+ .*/;
const SSDP_HEADER = /^([^:]+):\s*(.*)$/;

/**
 * Logger interface compatible with the subset of the bunyan API that the
 * original package used. The default is a no-op logger; pass your own via
 * `SsdpOptions.logger` if you want logging.
 */
export interface Logger {
  trace(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export interface SsdpOptions {
  /** SSDP signature. Defaults to a generated signature. */
  ssdpSig?: string;

  /** SSDP multicast group. Defaults to `239.255.255.250`. */
  ssdpIp?: string;

  /** SSDP port. Defaults to `1900`. */
  ssdpPort?: string | number;

  /** Multicast TTL. Defaults to `1`. */
  ssdpTtl?: number;

  /** Path to SSDP description file. Defaults to `upnp/desc.html`. */
  description?: string;

  /** SSDP Unique Device Name. */
  udn?: string;

  /** Packet TTL (cache timeout in seconds). Defaults to `1800`. */
  ttl?: number;

  /** Custom logger. Defaults to a no-op logger. */
  logger?: Logger;
}

/** Headers of an SSDP message, keyed by uppercase header name. */
export type SsdpHeaders = Record<string, string>;

/** Event map of the `SSDP` class. */
export interface SsdpEvents {
  'advertise-alive': (headers: SsdpHeaders) => void;
  'advertise-bye': (headers: SsdpHeaders) => void;
  response: (message: string, remoteInfo: RemoteInfo) => void;
}

// These mirror the values in package.json; they are hardcoded here because
// importing package.json at runtime would not work reliably in every
// environment (bundlers, test runners) that this library may be used in.
// Keep them in sync with package.json when bumping the version.
const MODULE_NAME = '@skybrush/ssdp-lite';
const MODULE_VERSION = '1.0.0';

const nop = (): void => {};

function createNopLogger(): Logger {
  return { trace: nop, debug: nop, info: nop, warn: nop, error: nop };
}

function getSsdpSignature(): string {
  const nodeVersion = process.version.slice(1);
  return `node.js/${nodeVersion} UPnP/1.1 ${MODULE_NAME}/${MODULE_VERSION}`;
}

/**
 * SSDP client and server.
 *
 * The same instance can act as a client (via `search()`) or as a server
 * (via `server()`), just like in the original `node-ssdp-lite` package.
 */
export class SSDP extends EventEmitter {
  /** UDP socket used for all SSDP communication. */
  sock: Socket = createSocket('udp4');

  /**
   * Stores whether we have already logged a response from a given address;
   * used only to avoid duplicate log entries, responses are always emitted.
   */
  responses: Record<string, boolean> = {};

  private readonly _logger: Logger;

  // Assigned in _init(), which is called from the constructor.
  private _ssdpSig!: string;
  private _ssdpIp!: string;
  private _ssdpPort!: string | number;
  private _ssdpTtl!: number;

  private _ipPort!: string;

  private _ttl!: number;

  private _description!: string;

  private _usns: Record<string, string> = {};
  private _udn!: string;

  /** Host and port of the HTTP description server; set by `server()`. */
  private _httphost: string | undefined;

  constructor(opts: SsdpOptions = {}) {
    super();

    this._logger = opts.logger ?? createNopLogger();

    this._init(opts);
    this._start();

    process.on('exit', () => {
      this.stop();
    });
  }

  /**
   * Initializes instance properties.
   */
  private _init(opts: SsdpOptions): void {
    this._ssdpSig = opts.ssdpSig ?? getSsdpSignature();

    this._ssdpIp = opts.ssdpIp ?? '239.255.255.250';
    this._ssdpPort = opts.ssdpPort ?? 1900;
    this._ssdpTtl = opts.ssdpTtl ?? 1;

    this._ipPort = `${this._ssdpIp}:${this._ssdpPort}`;

    this._ttl = opts.ttl ?? 1800;

    this._description = opts.description ?? 'upnp/desc.html';

    this._usns = {};
    this._udn = opts.udn ?? 'uuid:f40c2981-7329-40b7-8b04-27f187aecfb5';
  }

  /**
   * Binds event listeners to the UDP socket.
   */
  private _start(): void {
    // Configure socket for either client or server.
    this.responses = {};

    this.sock.on('error', (err) => {
      this._logger.error(err, 'Socker error');
    });

    this.sock.on('message', (msg, rinfo) => {
      this._parseMessage(msg, rinfo);
    });

    this.sock.on('listening', () => {
      const addr = this.sock.address() as AddressInfo;

      this._logger.info(
        `SSDP listening on http://${addr.address}:${addr.port}`
      );

      this.sock.addMembership(this._ssdpIp);
      this.sock.setMulticastTTL(this._ssdpTtl);
    });
  }

  /**
   * Routes a network message to the appropriate handler.
   */
  private _parseMessage(msg: Buffer, rinfo: RemoteInfo): void {
    const message = msg.toString();

    this._logger.trace({ message: `\n${message}` }, 'Multicast message');

    const type = message.split('\r\n').shift() ?? '';

    // HTTP/#.# ### Response
    if (HTTP_HEADER.test(type)) {
      this._parseResponse(message, rinfo);
    } else {
      this._parseCommand(message, rinfo);
    }
  }

  /**
   * Parses an SSDP command such as `NOTIFY * HTTP/1.1` or
   * `M-SEARCH * HTTP/1.1`.
   */
  private _parseCommand(msg: string, rinfo: RemoteInfo): void {
    const lines = msg.split('\r\n');
    const type = (lines.shift() ?? '').split(' '); // command, such as "NOTIFY * HTTP/1.1"
    const method = type[0];

    const headers: SsdpHeaders = {};

    for (const line of lines) {
      if (line.length > 0) {
        const pairs = line.match(SSDP_HEADER);
        if (pairs) {
          // e.g. {'HOST': 239.255.255.250:1900}
          headers[pairs[1].toUpperCase()] = pairs[2];
        }
      }
    }

    switch (method) {
      case 'NOTIFY':
        this._notify(headers, msg, rinfo);
        break;

      case 'M-SEARCH':
        this._msearch(headers, msg, rinfo);
        break;

      default:
        this._logger.warn(
          { message: `\n${msg}`, rinfo },
          'Unhandled NOTIFY event'
        );
    }
  }

  /**
   * Handles the NOTIFY command.
   */
  private _notify(headers: SsdpHeaders, msg: string, rinfo: RemoteInfo): void {
    if (!headers.NTS) {
      this._logger.trace(headers, 'Missing NTS header');
    }

    // The original package crashed with a TypeError on messages without an
    // NTS header; we treat them as unhandled instead.
    switch ((headers.NTS ?? '').toLowerCase()) {
      // Device coming to life.
      case 'ssdp:alive':
        this.emit('advertise-alive', headers);
        break;

      // Device shutting down.
      case 'ssdp:byebye':
        this.emit('advertise-bye', headers);
        break;

      default:
        this._logger.trace(
          { message: `\n${msg}`, rinfo },
          'Unhandled NOTIFY event'
        );
    }
  }

  /**
   * Handles the M-SEARCH command.
   */
  private _msearch(headers: SsdpHeaders, msg: string, rinfo: RemoteInfo): void {
    this._logger.trace(
      { ST: headers.ST, address: rinfo.address, port: rinfo.port },
      'SSDP M-SEARCH event'
    );

    if (!headers.MAN || !headers.MX || !headers.ST) return;

    this._inMSearch(headers.ST, rinfo);
  }

  /**
   * Parses an SSDP response message.
   */
  private _parseResponse(msg: string, rinfo: RemoteInfo): void {
    if (!this.responses[rinfo.address]) {
      this.responses[rinfo.address] = true;
      this._logger.info({ message: `\n${msg}` }, 'SSDP response');
    }

    this.emit('response', msg, rinfo);
  }

  private _inMSearch(st: string, rinfo: RemoteInfo): void {
    const peer = rinfo.address;
    const port = rinfo.port;

    let target = st;
    if (st[0] === '"' && st[st.length - 1] === '"') {
      target = st.slice(1, -1); // unwrap quoted string
    }

    for (const usn of Object.keys(this._usns)) {
      const udn = this._usns[usn];

      if (target === 'ssdp:all' || usn === target) {
        const pkt = this.getSSDPHeader(
          '200 OK',
          {
            ST: usn,
            USN: udn,
            LOCATION: `${this._httphost}/${this._description}`,
            'CACHE-CONTROL': `max-age=${this._ttl}`,
            DATE: new Date().toUTCString(),
            SERVER: this._ssdpSig,
            EXT: '',
          },
          true
        );

        this._logger.trace({ peer, port }, 'Sending a 200 OK for an M-SEARCH');

        const message = Buffer.from(pkt);

        this.sock.send(message, 0, message.length, port, peer, () => {
          this._logger.trace({ message: pkt }, 'Sent M-SEARCH response');
        });
      }
    }
  }

  /**
   * Registers a USN (Unique Service Name) for the device that this instance
   * advertises when acting as a server.
   */
  addUSN(device: string): void {
    this._usns[device] = `${this._udn}::${device}`;
  }

  /**
   * Sends an M-SEARCH request on the multicast group. Responses are emitted
   * as `response` events.
   *
   * @param st Search target, e.g. `ssdp:all`
   */
  search(st: string): void {
    // The original package fired the request from the callback of a DNS
    // lookup of the local hostname, effectively delaying the send until the
    // lookup completes (successfully or not). We keep that behaviour.
    lookup(hostname(), () => {
      const pkt = this.getSSDPHeader('M-SEARCH', {
        HOST: this._ipPort,
        ST: st,
        MAN: '"ssdp:discover"',
        MX: 3,
      });

      this._logger.trace('Sending an M-SEARCH request');

      const message = Buffer.from(pkt);

      this.sock.send(
        message,
        0,
        message.length,
        Number(this._ssdpPort),
        this._ssdpIp,
        () => {
          this._logger.trace({ message: pkt }, 'Sent M-SEARCH request');
        }
      );
    });
  }

  /**
   * Binds the UDP socket to an interface/port and starts advertising.
   *
   * @param ip Interface to bind to; `0.0.0.0` or omitted means all
   *        interfaces, in which case the local hostname is resolved to
   *        construct the LOCATION header.
   * @param portno Port of the HTTP server that serves the description file.
   *        Defaults to `10293`.
   */
  server(ip?: string, portno?: string | number): void {
    const port = portno ?? '10293';

    this._usns[this._udn] = this._udn;

    this._logger.trace(`Will try to bind to ${ip}:${this._ssdpPort}`);

    const bind = (): void => {
      this.sock.bind(Number(this._ssdpPort), ip, () => {
        this._logger.info(`UDP socket bound to ${ip}:${this._ssdpPort}`);

        this.advertise(false);

        setTimeout(() => {
          this.advertise(false);
        }, 1000);

        // Wake up.
        setTimeout(() => {
          this.advertise();
        }, 2000);
        setTimeout(() => {
          this.advertise();
        }, 3000);

        // Ad loop.
        setInterval(() => {
          this.advertise();
        }, 10000);
      });
    };

    if (!ip || ip === '0.0.0.0') {
      lookup(hostname(), (_err, add) => {
        this._httphost = `http://${add}:${port}`;
        bind();
      });
    } else {
      this._httphost = `http://${ip}:${port}`;
      bind();
    }
  }

  /**
   * Advertises shutdown and closes the UDP socket.
   */
  stop(): void {
    this.advertise(false);
    this.advertise(false);
    this.sock.close();
  }

  /**
   * Advertises (or withdraws) all registered USNs on the multicast group.
   *
   * @param alive Whether the device is alive; defaults to `true`
   */
  advertise(alive?: boolean): void {
    if (!this.sock) return;

    const isAlive = alive ?? true;

    for (const usn of Object.keys(this._usns)) {
      const udn = this._usns[usn];

      const heads: Record<string, string | number> = {
        HOST: this._ipPort,
        NT: usn,
        NTS: isAlive ? 'ssdp:alive' : 'ssdp:byebye',
        USN: udn,
      };

      if (isAlive) {
        heads.LOCATION = `${this._httphost}/${this._description}`;
        heads['CACHE-CONTROL'] = 'max-age=1800';
        heads.SERVER = this._ssdpSig;
      }

      this._logger.trace('Sending an advertisement event');

      const out = Buffer.from(this.getSSDPHeader('NOTIFY', heads));

      this.sock.send(
        out,
        0,
        out.length,
        Number(this._ssdpPort),
        this._ssdpIp,
        () => {
          this._logger.trace(
            { message: out.toString() },
            'Outgoing server message'
          );
        }
      );
    }
  }

  /**
   * Constructs an SSDP message from the given header lines.
   *
   * @param head Message type, e.g. `NOTIFY` or `M-SEARCH`
   * @param vars Header names and values
   * @param res Whether to format the result as a response
   *        (`HTTP/1.1 <head>`) instead of a command (`<head> * HTTP/1.1`)
   */
  getSSDPHeader(
    head: string,
    vars: Record<string, string | number>,
    res?: boolean
  ): string {
    const asResponse = res ?? false;

    let ret = asResponse ? `HTTP/1.1 ${head}\r\n` : `${head} * HTTP/1.1\r\n`;

    for (const n of Object.keys(vars)) {
      ret += `${n}: ${vars[n]}\r\n`;
    }

    return ret + '\r\n';
  }

  // Typed event listener registration, mirroring the EventEmitter API but
  // restricted to the events emitted by this class.

  override on<K extends keyof SsdpEvents>(
    event: K,
    listener: SsdpEvents[K]
  ): this;
  override on(
    event: string | symbol,
    listener: (...args: unknown[]) => void
  ): this;
  override on(
    event: string | symbol,
    listener: (...args: unknown[]) => void
  ): this {
    return super.on(event, listener as (...args: unknown[]) => void);
  }
}

export default SSDP;
