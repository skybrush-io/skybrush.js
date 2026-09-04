import { createTrajectoryPlayer, type Trajectory } from '@skybrush/show-format';

import { getMinimumAndMaximumAltitudesAt } from '../dist/index.js';

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

test('minimum and maximum swarm altitudes at sampled times', () => {
  const ascending = createTrajectoryPlayer(createVerticalTrajectory(1, 3));
  const descending = createTrajectoryPlayer(createVerticalTrajectory(2, 0));

  expect(
    getMinimumAndMaximumAltitudesAt([ascending, descending], [0, 1, 2])
  ).toEqual([
    [1, 1, 0],
    [2, 2, 3],
  ]);

  expect(
    getMinimumAndMaximumAltitudesAt([ascending, descending], [0, 0.5, 1.75])
  ).toEqual([
    [1, 1.5, 0.25],
    [2, 1.5, 2.75],
  ]);
});

test('minimum and maximum swarm altitudes without players or timestamps', () => {
  const player = createTrajectoryPlayer(createVerticalTrajectory(1, 3));

  expect(getMinimumAndMaximumAltitudesAt([], [0, 1, 2])).toEqual([[], []]);
  expect(getMinimumAndMaximumAltitudesAt([player], [])).toEqual([[], []]);
});
