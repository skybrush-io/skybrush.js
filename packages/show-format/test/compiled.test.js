const {loadCompiledShow} = require('..');

const test = require('ava');
const fs = require('fs');
const path = require('path');

const load = async (fixture) => {
  const data = await fs.promises.readFile(
    path.join(__dirname, 'fixtures', fixture)
  );
  return loadCompiledShow(data);
};

test('valid show file', async (t) => {
  await load('test-show.skyc');
  t.pass();
});
