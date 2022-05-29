import test from 'ava';
import { Buffer } from 'node:buffer';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { Asset, loadCompiledShow } from '../src';

const load = async (fixture: string, options?: { assets: boolean }) => {
  const data = await fs.promises.readFile(
    path.join(__dirname, '..', '..', 'test', 'fixtures', fixture + '.skyc')
  );
  return loadCompiledShow(data, options);
};

test('valid show file', async (t) => {
  const show = await load('test-show');
  t.assert(show.meta?.title === 'Test show for Skybrush Live Demo');
  t.assert(show.swarm.drones.length === 3);
});

test('valid show file with assets', async (t) => {
  const show = await load('test-show-with-assets', { assets: true });
  const audio = show.media?.audio?.data;
  t.assert(audio instanceof Uint8Array);
  t.assert(Buffer.from('lalalalalaaaaa').equals(audio as Uint8Array));
});

test('valid show file with assets when asset parsing is disabled', async (t) => {
  const show = await load('test-show-with-assets');
  const audio = show.media?.audio?.data;
  t.assert(audio instanceof Asset);
  t.assert((audio as Asset).filename === 'assets/music.mp3');
});
