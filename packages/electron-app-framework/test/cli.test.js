'use strict';

// eslint-disable-next-line unicorn/prefer-node-protocol
const process = require('process');

const setupCli = require('../lib/cli');

test('CLI parser ignores -psn_ arguments on macOS', () => {
  const parser = setupCli();
  let parsed;

  parser.option('-p, --port <number>', 'set port number');

  const parse = (args) => parser.parse(args, { from: 'user' });

  const psnArg = process.platform === 'darwin' ? '-psn_34_567829' : '-d';

  parsed = parse([psnArg, 'foobar']);
  expect(parsed.opts().port).toBe(undefined);
  expect(parsed.args).toEqual(['foobar']);

  parsed = parse([psnArg, '-p', '8000', 'foobar']);
  expect(parsed.opts().port).toBe('8000');
  expect(parsed.args).toEqual(['foobar']);

  parsed = parse(['foobar', 'baz', psnArg, '-p5555']);
  expect(parsed.opts().port).toBe('5555');
  expect(parsed.args).toEqual(['foobar', 'baz']);
});
