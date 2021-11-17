const {
  getCamerasFromShowSpecification,
  validateShowSpecification,
} = require('..');
const test = require('ava');

test('retrieve cameras from show specification', (t) => {
  // eslint-disable-next-line import/no-unresolved
  const spec = require('./fixtures/test-show');
  validateShowSpecification(spec);
  const cameras = getCamerasFromShowSpecification(spec);

  t.assert(Array.isArray(cameras));
  t.assert(cameras.length === 2);
  t.deepEqual(cameras[0], {
    name: 'First camera',
    type: 'perspective',
    position: [1, 2, 3],
    orientation: [1, 0, 0, 0],
  });
  t.deepEqual(cameras[1], {
    name: 'Second camera',
    type: 'perspective',
    position: [10, 7, 4],
    orientation: [-0.707, 0, 0.707, 0],
    default: true,
  });

  delete spec.environment.cameras;
  t.assert(getCamerasFromShowSpecification(spec).length === 0);

  t.throws(
    () => {
      spec.environment.cameras = 'foo';
      getCamerasFromShowSpecification(spec);
    },
    {
      message: /must be an array/,
    }
  );
});
