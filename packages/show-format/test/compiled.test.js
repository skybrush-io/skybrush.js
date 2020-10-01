const { Asset, loadCompiledShow } = require('..');

const test = require('ava');
const fs = require('fs');
const path = require('path');

const load = async (fixture, options) => {
  const data = await fs.promises.readFile(
    path.join(__dirname, 'fixtures', fixture + '.skyc')
  );
  return loadCompiledShow(data, options);
};

test('valid show file', async (t) => {
  const show = await load('test-show');
  t.assert(show.meta.title === 'Test show for Skybrush Live Demo');
  t.assert(show.swarm.drones.length === 3);
});

test('valid show file with assets', async (t) => {
  const show = await load('test-show-with-assets', { assets: true });
  const audio = show.media.audio.data;
  t.assert(audio instanceof Uint8Array);
  t.assert(Buffer.from('lalalalalaaaaa').equals(audio));
});

test('valid show file with assets when asset parsing is disabled', async (t) => {
  const show = await load('test-show-with-assets');
  const audio = show.media.audio.data;
  t.assert(audio instanceof Asset);
  t.assert(audio.filename === 'assets/music.mp3');
});
