import process from 'node:process';

import setupCli from '../dist/cli.js';

test('CLI parser ignores -psn_ arguments on macOS', () => {
  let parsed;
  const parsedArgs: string[] = [];
  const parser = setupCli();

  // Do not exit when a parsing error occurs
  parser.exitOverride();

  parser.argument('<rest...>', 'remaining arguments');
  parser.option('-p, --port <number>', 'set port number');
  parser.action((rest) => {
    parsedArgs.length = 0;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    parsedArgs.splice(0, 0, ...rest);
  });

  const parse = (args: string[]) => parser.parse(args, { from: 'user' });

  const psnArg = process.platform === 'darwin' ? '-psn_34_567829' : '-d';

  parsed = parse([psnArg, 'foobar']);
  expect(parsed.opts().port).toBe(undefined);
  expect(parsed.args).toEqual(['foobar']);
  expect(parsedArgs).toEqual(['foobar']);

  parsed = parse([psnArg, '-p', '8000', 'foobar']);
  expect(parsed.opts().port).toBe('8000');
  expect(parsed.args).toEqual(['foobar']);
  expect(parsedArgs).toEqual(['foobar']);

  parsed = parse(['foobar', 'baz', psnArg, '-p5555']);
  expect(parsed.opts().port).toBe('5555');
  expect(parsed.args).toEqual(['foobar', 'baz']);
  expect(parsedArgs).toEqual(['foobar', 'baz']);
});
