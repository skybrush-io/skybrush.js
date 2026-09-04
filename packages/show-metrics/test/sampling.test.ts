import { createTrajectoryPlayer } from '@skybrush/show-format';

import {
  calculateAndAggregateSamples,
  getMinimumAndMaximumSampleVectors,
} from '../dist/index.js';

const createVerticalTrajectory = (
  initialAltitude: number,
  finalAltitude: number
): Trajectory => ({
  version: 1,
  points: [
    [0, [0, 0, initialAltitude], []],
    [2, [0, 0, finalAltitude], []],
  ],
});

test('sample calculation and aggregation', () => {
  const ascending = createTrajectoryPlayer(createVerticalTrajectory(1, 3));
  const descending = createTrajectoryPlayer(createVerticalTrajectory(2, 0));

  expect(
    calculateAndAggregateSamples(
      [ascending, descending],
      [0, 1, 2],
      (player, timestamps) =>
        timestamps.map((timestamp) =>
          player === ascending ? timestamp : 2 - timestamp
        ),
      getMinimumAndMaximumSampleVectors
    )
  ).toEqual([
    [0, 1, 0],
    [2, 1, 2],
  ]);

  expect(
    calculateAndAggregateSamples(
      [],
      [0, 1],
      () => [],
      (samplesByDrone, timestamps) => [samplesByDrone.length, timestamps.length]
    )
  ).toEqual([0, 2]);
});

test('sample calculation rejects incorrectly sized sample vectors', () => {
  const player = createTrajectoryPlayer(createVerticalTrajectory(1, 3));

  expect(() =>
    calculateAndAggregateSamples(
      [player],
      [0, 1],
      () => [0],
      () => null
    )
  ).toThrow(RangeError);
});
