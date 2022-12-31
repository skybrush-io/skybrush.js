import test from 'ava';

import {
  getCamerasFromShowSpecification,
  validateShowSpecification,
} from '../src';
import { CameraType, type ShowSpecification } from '../src/types';

import * as originalSpec from './fixtures/test-show.json';

test('retrieve cameras from show specification', (t) => {
  // make a deep copy of originalSpec because we cannot delete from it
  const spec: ShowSpecification = JSON.parse(
    JSON.stringify(originalSpec)
  ) as ShowSpecification;

  validateShowSpecification(spec);
  const cameras = getCamerasFromShowSpecification(spec);

  t.assert(Array.isArray(cameras));
  t.assert(cameras.length === 2);
  t.deepEqual(cameras[0], {
    name: 'First camera',
    type: CameraType.PERSPECTIVE,
    position: [1, 2, 3],
    orientation: [1, 0, 0, 0],
  });
  t.deepEqual(cameras[1], {
    name: 'Second camera',
    type: CameraType.PERSPECTIVE,
    position: [10, 7, 4],
    orientation: [-0.707, 0, 0.707, 0],
    default: true,
  });

  delete spec.environment.cameras;
  t.assert(getCamerasFromShowSpecification(spec).length === 0);

  t.throws(
    () => {
      (spec.environment as any).cameras = 'foo';
      getCamerasFromShowSpecification(spec);
    },
    {
      message: /must be an array/,
    }
  );
});
