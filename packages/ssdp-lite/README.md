# @skybrush/ssdp-lite

SSDP (Simple Service Discovery Protocol) client and server library for
Skybrush, written in TypeScript.

This package is a TypeScript port of
[node-ssdp-lite](https://github.com/sweetpi/node-ssdp-lite), which is itself a
fork of [node-ssdp](https://github.com/diversario/node-ssdp) with the logging
dependency removed.

## Status

Initial TypeScript port of `node-ssdp-lite@0.2.0` is complete. The public
API (`new SSDP(opts)`, `addUSN()`, `search()`, `server()`, `stop()`,
`advertise()`, `getSSDPHeader()` and the `advertise-alive`, `advertise-bye`
and `response` events) is identical to the original.

Differences from the original:

- The old `prototype`-based class is a proper ES2015+ TypeScript class;
  it can no longer be called without `new`.
- `logger.js` (which depended on bunyan) was not ported. Pass any
  bunyan-compatible logger via `SsdpOptions.logger`; the default is a
  no-op logger, as in the original `index.js`.
- NOTIFY messages without an `NTS` header are treated as unhandled
  instead of crashing with a `TypeError`.

## Usage

See `test/ssdp.test.ts` and the examples in the upstream repository for
usage patterns.

## License

MIT
