'use strict';

const test = require('ava');
const process = require('process');
const setupCli = require('../lib/cli');

test('CLI parser ignores -psn_ arguments on macOS', (t) => {
  const parser = setupCli();
  let parsed;

  parser.option('-p, --port <number>', 'set port number');

  const parse = (args) => parser.parse(args, { from: 'user' });

  const psnArg = process.platform === 'darwin' ? '-psn_34_567829' : '-d';

  parsed = parse([psnArg, 'foobar']);
  t.is(parsed.opts().port, undefined);
  t.deepEqual(parsed.args, ['foobar']);

  parsed = parse([psnArg, '-p', '8000', 'foobar']);
  t.is(parsed.opts().port, '8000');
  t.deepEqual(parsed.args, ['foobar']);

  parsed = parse(['foobar', 'baz', psnArg, '-p5555']);
  t.is(parsed.opts().port, '5555');
  t.deepEqual(parsed.args, ['foobar', 'baz']);
});
