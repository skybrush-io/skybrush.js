import { Buffer } from 'node:buffer';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { Asset, loadCompiledShow } from '../src';

const load = async (fixture: string, options?: { assets: boolean }) => {
  const data = await fs.promises.readFile(
    path.join(__dirname, 'fixtures', fixture + '.skyc')
  );
  return loadCompiledShow(data, options);
};

test('valid show file', async () => {
  const show = await load('test-show');
  expect(show.meta?.title).toBe('Test show for Skybrush Live Demo');
  expect(show.swarm.drones.length).toBe(3);
});

test('valid show file with assets', async () => {
  const show = await load('test-show-with-assets', { assets: true });
  const audio = show.media?.audio?.data;
  expect(audio).toBeInstanceOf(Uint8Array);
  expect(Buffer.from('lalalalalaaaaa').equals(audio as Uint8Array)).toBe(true);
});

test('valid show file with assets when asset parsing is disabled', async () => {
  const show = await load('test-show-with-assets');
  const audio = show.media?.audio?.data;
  expect(audio).toBeInstanceOf(Asset);
  expect((audio as Asset).filename).toBe('assets/music.mp3');
});
