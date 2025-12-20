import {
  getCamerasFromShowSpecification,
  validateShowSpecification,
} from '../dist/index.js';
import { CameraType, type ShowSpecification } from '../dist/types.js';

import * as originalSpec from './fixtures/test-show.json';

test('retrieve cameras from show specification', () => {
  // make a deep copy of originalSpec because we cannot delete from it
  const spec: ShowSpecification = JSON.parse(
    JSON.stringify(originalSpec)
  ) as ShowSpecification;

  validateShowSpecification(spec);
  const cameras = getCamerasFromShowSpecification(spec);

  expect(Array.isArray(cameras)).toBe(true);
  expect(cameras.length).toBe(2);
  expect(cameras[0]).toEqual({
    name: 'First camera',
    type: CameraType.PERSPECTIVE,
    position: [1, 2, 3],
    orientation: [1, 0, 0, 0],
  });
  expect(cameras[1]).toEqual({
    name: 'Second camera',
    type: CameraType.PERSPECTIVE,
    position: [10, 7, 4],
    orientation: [-0.707, 0, 0.707, 0],
    default: true,
  });

  delete spec.environment.cameras;
  expect(getCamerasFromShowSpecification(spec).length).toBe(0);

  expect(() => {
    (spec.environment as any).cameras = 'foo';
    getCamerasFromShowSpecification(spec);
  }).toThrow(/must be an array/);
});
