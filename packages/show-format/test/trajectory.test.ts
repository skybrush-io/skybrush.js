import {
  createTrajectoryPlayer,
  splitTimedBezierCurve,
  splitTimedBezierCurveAt,
  timedBezierCurveToTrajectorySegment,
  trajectorySegmentsInTimeWindow,
  trajectorySegmentsToTimedBezierCurve,
} from '../dist/index.js';
import type { StrideOptions, Trajectory, Vector3Tuple } from '../dist/types.js';
import { shuffle } from '../dist/utils.js';

const trajectory: Trajectory = {
  version: 1,
  takeoffTime: 6,
  points: [
    // Start point
    [0, [0, 0, 0], []],
    // Takeoff to Z=12, starts at T=6, ends at T=12
    [
      6,
      [0, 0, 12],
      [
        [0, 0, 0],
        [0, 0, 12],
      ],
    ],
    // Cubic curve from (0, 0, 12) to (12, 12, 12), passing through (12, 0, 12), starts at T=12, ends at T=28
    [
      22,
      [12, 12, 12],
      [
        [-4, -20, 12],
        [32, 16, 12],
      ],
    ],
    // Quadratic curve from (12, 12, 12) to (0, 0, 12), passing through (0, 12, 12), starts at T=28, ends at T=44
    [38, [0, 0, 12], [[-6, 18, 12]]],
    // Straight line from (0, 0, 12) to (-6, -6, 18), starts at T=44, ends at T=56
    [50, [-6, -6, 18], []],
    // Sudden jump from (-6, -6, 18) to (6, 3, 12), starts at T=56, jump happens at T=60
    [53.9990234375, [-6, -6, 18], []],
    [54, [6, 3, 12], []],
    // Landing to Z=0, starts at T=60, ends at T=66
    [
      60,
      [6, 3, 0],
      [
        [6, 3, 12],
        [6, 3, 0],
      ],
    ],
  ],
};

const numberEqual = (value: number, expected: number) => {
  expect(value).toBe(expected);
};

const vector3Equals = (
  value: Vector3Tuple,
  expected: Vector3Tuple,
  eps = 1e-5,
  _messagePrefix = ''
) => {
  expect(Math.abs(value[0] - expected[0])).toBeLessThan(eps);
  expect(Math.abs(value[1] - expected[1])).toBeLessThan(eps);
  expect(Math.abs(value[2] - expected[2])).toBeLessThan(eps);
};

const vector3ArrayEquals = (
  value: Vector3Tuple[],
  expected: Vector3Tuple[],
  eps = 1e-5,
  messagePrefix = ''
) => {
  expect(value.length).toEqual(expected.length);
  for (let i = 0; i < value.length; i++) {
    vector3Equals(value[i], expected[i], eps, messagePrefix);
  }
};

/* ************************************************************************ */
/* Tests related to evaluating the trajectory at a given point              */
/* ************************************************************************ */

const expectedPositions: Record<number, Vector3Tuple> = {
  [-2]: [0, 0, 0],
  0: [0, 0, 0],
  3: [0, 0, 0],
  6: [0, 0, 0],
  8: [0, 0, 3 + 1 / 9],
  10: [0, 0, 9 - 1 / 9],
  12: [0, 0, 12],
  14: [6 / 32, -162 / 32, 12],
  16: [3, -6, 12],
  18: [234 / 32, -126 / 32, 12],
  20: [12, 0, 12],
  22: [510 / 32, 150 / 32, 12],
  24: [18, 9, 12],
  26: [546 / 32, 378 / 32, 12],
  28: [12, 12, 12],
  30: [63 / 8, 105 / 8, 12],
  32: [4.5, 13.5, 12],
  34: [15 / 8, 105 / 8, 12],
  36: [0, 12, 12],
  38: [-9 / 8, 81 / 8, 12],
  40: [-1.5, 7.5, 12],
  42: [-9 / 8, 33 / 8, 12],
  44: [0, 0, 12],
  50: [-3, -3, 15],
  56: [-6, -6, 18],
  57: [-6, -6, 18],
  58: [-6, -6, 18],
  59: [-6, -6, 18],
  60: [6, 3, 12],
  62: [6, 3, 9 - 1 / 9],
  64: [6, 3, 3 + 1 / 9],
  66: [6, 3, 0],
  68: [6, 3, 0],
  75: [6, 3, 0],
  100: [6, 3, 0],
};

const createPositionEvaluator = (trajectory: Trajectory) => {
  const { getPositionAt } = createTrajectoryPlayer(trajectory);
  return (t: number): Vector3Tuple => {
    const vector = { x: 0, y: 0, z: 0 };
    getPositionAt(t, vector);
    return [vector.x, vector.y, vector.z];
  };
};

const createMultiPositionEvaluator = (
  trajectory: Trajectory,
  options?: StrideOptions
) => {
  const { getPositionsAt } = createTrajectoryPlayer(trajectory);
  return (ts: number[]): Vector3Tuple[] => {
    const { start = 0, step = 3 } = options ?? {};

    const arr = new Float32Array(ts.length * step);
    getPositionsAt(ts, arr, options);

    const result: Vector3Tuple[] = [];
    for (let i = 0; i < ts.length; i++) {
      const i3 = i * step + start;
      result.push([arr[i3], arr[i3 + 1], arr[i3 + 2]]);
    }
    return result;
  };
};

// TODO: No segments is no longer valid according to the schema
// test.failing('trajectory evaluation, no segments', (t) => {
//   const ev = createPositionEvaluator({ version: 1, points: [] });
//   const eq = vector3Equals;
//
//   for (const t of [
//     Number.NEGATIVE_INFINITY,
//     -2,
//     0,
//     3,
//     6,
//     Number.POSITIVE_INFINITY,
//   ]) {
//     eq(ev(t), [0, 0, 0]);
//   }
// });

test('trajectory evaluation, segment before takeoff time', () => {
  const ev = createPositionEvaluator(trajectory);
  const evMany = createMultiPositionEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [-2, 0, 3, 6];
  for (const t of ts) {
    eq(ev(t), expectedPositions[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedPositions[t])
  );

  eq(ev(Number.NEGATIVE_INFINITY), expectedPositions[ts[0]]);
});

test('trajectory evaluation, takeoff segment', () => {
  const ev = createPositionEvaluator(trajectory);
  const evMany = createMultiPositionEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [6, 8, 10, 12];
  for (const t of ts) {
    eq(ev(t), expectedPositions[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedPositions[t])
  );
});

test('trajectory evaluation, first and second curve', () => {
  const ev = createPositionEvaluator(trajectory);
  const evMany = createMultiPositionEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [
    12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44,
  ];
  for (const t of ts) {
    eq(ev(t), expectedPositions[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedPositions[t])
  );
});

test('trajectory evaluation, linear segment', () => {
  const ev = createPositionEvaluator(trajectory);
  const evMany = createMultiPositionEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [44, 50, 56];
  for (const t of ts) {
    eq(ev(t), expectedPositions[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedPositions[t])
  );
});

test('trajectory evaluation, constant segment', () => {
  const ev = createPositionEvaluator(trajectory);
  const evMany = createMultiPositionEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [56, 57, 58, 59, 60];
  for (const t of ts) {
    eq(ev(t), expectedPositions[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedPositions[t])
  );
});

test('trajectory evaluation, landing segment', () => {
  const ev = createPositionEvaluator(trajectory);
  const evMany = createMultiPositionEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [60, 62, 64, 66];
  for (const t of ts) {
    eq(ev(t), expectedPositions[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedPositions[t])
  );
});

test('trajectory evaluation, segment after landing time', () => {
  const ev = createPositionEvaluator(trajectory);
  const evMany = createMultiPositionEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [66, 68, 75, 100];
  for (const t of ts) {
    eq(ev(t), expectedPositions[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedPositions[t])
  );

  eq(ev(Number.POSITIVE_INFINITY), expectedPositions[ts[ts.length - 1]]);
});

test('trajectory evaluation, unsupported segment type', () => {
  const ev = createPositionEvaluator({
    version: 1,
    points: [
      // Start point
      [0, [0, 0, 0], []],
      // Unsupported segment (too many control points)
      [
        10,
        [10, 0, 0],
        [
          [0, 0, 0],
          [2, 0, 0],
          [4, 0, 0],
          [6, 0, 0],
        ],
      ],
    ],
  });

  expect(() => ev(5)).toThrow(/supported/);
});

test('trajectory evaluation, shuffled', () => {
  const ev = createPositionEvaluator(trajectory);
  const evMany = createMultiPositionEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = Object.keys(expectedPositions).map((x) => Number.parseInt(x, 10));

  for (let i = 0; i < 5; i++) {
    shuffle(ts);

    for (const t of ts) {
      eq(ev(t), expectedPositions[t]);
    }

    eqArr(
      evMany(ts),
      ts.map((t) => expectedPositions[t])
    );
  }
});

/* ************************************************************************ */
/* Tests related to evaluating the velocity at a given point                */
/* ************************************************************************ */

const expectedVelocities: Record<number, Vector3Tuple> = {
  [-2]: [0, 0, 0],
  0: [0, 0, 0],
  3: [0, 0, 0],
  6: [0, 0, 0],
  8: [0, 0, 8 / 3],
  10: [0, 0, 8 / 3],
  12: [-0.75, -3.75, 0], // or [0, 0, 0] from the left
  14: [0.84375, -1.40625, 0],
  16: [1.875, 0.375, 0],
  18: [2.34375, 1.59375, 0],
  20: [2.25, 2.25, 0],
  22: [1.59375, 2.34375, 0],
  24: [0.375, 1.875, 0],
  26: [-1.40625, 0.84375, 0],
  28: [-2.25, 0.75, 0], // or [-3.75, -0.75, 0] from the left
  30: [-1.875, 0.375, 0],
  32: [-1.5, 0, 0],
  34: [-1.125, -0.375, 0],
  36: [-0.75, -0.75, 0],
  38: [-0.375, -1.125, 0],
  40: [0, -1.5, 0],
  42: [0.375, -1.875, 0],
  44: [-0.5, -0.5, 0.5], // or [0.75, -2.25, 0] from the left
  50: [-0.5, -0.5, 0.5],
  56: [0, 0, 0], // or [-0.5, -0.5, 0.5] from the left
  57: [0, 0, 0],
  58: [0, 0, 0],
  59: [0, 0, 0],
  60: [0, 0, 0], // or [12288, 9216, -6144] from the left
  62: [0, 0, -8 / 3],
  64: [0, 0, -8 / 3],
  66: [0, 0, 0],
  68: [0, 0, 0],
  75: [0, 0, 0],
  100: [0, 0, 0],
};

const createVelocityEvaluator = (trajectory: Trajectory) => {
  const { getVelocityAt } = createTrajectoryPlayer(trajectory);
  return (t: number): Vector3Tuple => {
    const vector = { x: 0, y: 0, z: 0 };
    getVelocityAt(t, vector);
    return [vector.x, vector.y, vector.z];
  };
};

const createMultiVelocityEvaluator = (
  trajectory: Trajectory,
  options?: StrideOptions
) => {
  const { getVelocitiesAt } = createTrajectoryPlayer(trajectory);
  return (ts: number[]): Vector3Tuple[] => {
    const { start = 0, step = 3 } = options ?? {};

    const arr = new Float32Array(ts.length * step);
    getVelocitiesAt(ts, arr, options);

    const result: Vector3Tuple[] = [];
    for (let i = 0; i < ts.length; i++) {
      const i3 = i * step + start;
      result.push([arr[i3], arr[i3 + 1], arr[i3 + 2]]);
    }
    return result;
  };
};

// TODO: No segments is no longer valid according to the schema
// test.failing('velocity evaluation, no segments', (t) => {
//   const ev = createVelocityEvaluator({ version: 1, points: [] });
//   const eq = vector3Equals;
//
//   for (const t of [
//     Number.NEGATIVE_INFINITY,
//     -2,
//     0,
//     3,
//     6,
//     Number.POSITIVE_INFINITY,
//   ]) {
//     eq(ev(t), [0, 0, 0]);
//   }
// });

test('velocity evaluation, segment before takeoff time', () => {
  const ev = createVelocityEvaluator(trajectory);
  const evMany = createMultiVelocityEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [-2, 0, 3, 6];
  for (const t of ts) {
    eq(ev(t), expectedVelocities[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedPositions[t])
  );

  eq(ev(Number.NEGATIVE_INFINITY), expectedVelocities[ts[0]]);
});

test('velocity evaluation, takeoff segment', () => {
  const ev = createVelocityEvaluator(trajectory);
  const evMany = createMultiVelocityEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [6, 8, 10, 12];
  for (const t of ts) {
    eq(ev(t), expectedVelocities[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedVelocities[t])
  );
});

test('velocity evaluation, first and second curve', () => {
  const ev = createVelocityEvaluator(trajectory);
  const evMany = createMultiVelocityEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [
    12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42,
    // 44 left out because the left and the right velocities are not equal
  ];
  for (const t of ts) {
    eq(ev(t), expectedVelocities[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedVelocities[t])
  );
});

test('velocity evaluation, linear segment', () => {
  const ev = createVelocityEvaluator(trajectory);
  const evMany = createMultiVelocityEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [44, 50, 56];
  for (const t of ts) {
    eq(ev(t), expectedVelocities[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedVelocities[t])
  );
});

test('velocity evaluation, constant segment', () => {
  const ev = createVelocityEvaluator(trajectory);
  const evMany = createMultiVelocityEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [56, 57, 58, 59, 60];
  for (const t of ts) {
    eq(ev(t), expectedVelocities[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedVelocities[t])
  );
});

test('velocity evaluation, landing segment', () => {
  const ev = createVelocityEvaluator(trajectory);
  const evMany = createMultiVelocityEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [60, 62, 64, 66];
  for (const t of ts) {
    eq(ev(t), expectedVelocities[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedVelocities[t])
  );
});

test('velocity evaluation, segment after landing time', () => {
  const ev = createVelocityEvaluator(trajectory);
  const evMany = createMultiVelocityEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = [66, 68, 75, 100];
  for (const t of ts) {
    eq(ev(t), expectedVelocities[t]);
  }

  eqArr(
    evMany(ts),
    ts.map((t) => expectedVelocities[t])
  );

  eq(ev(Number.POSITIVE_INFINITY), expectedVelocities[ts[ts.length - 1]]);
});

test('velocity evaluation, unsupported segment type', () => {
  const ev = createVelocityEvaluator({
    version: 1,
    points: [
      // Start point
      [0, [0, 0, 0], []],
      // Unsupported segment (too many control points)
      [
        10,
        [10, 0, 0],
        [
          [0, 0, 0],
          [2, 0, 0],
          [4, 0, 0],
          [6, 0, 0],
        ],
      ],
    ],
  });

  expect(() => ev(5)).toThrow(/supported/);
});

test('velocity evaluation, shuffled', () => {
  const ev = createVelocityEvaluator(trajectory);
  const evMany = createMultiVelocityEvaluator(trajectory);
  const eq = vector3Equals;
  const eqArr = vector3ArrayEquals;

  const ts = Object.keys(expectedVelocities).map((x) => Number.parseInt(x, 10));

  for (let i = 0; i < 5; i++) {
    shuffle(ts);

    for (const t of ts) {
      eq(ev(t), expectedVelocities[t]);
    }

    eqArr(
      evMany(ts),
      ts.map((t) => expectedVelocities[t])
    );
  }
});

/* ************************************************************************ */
/* Tests related to trajectory splitting and tranformation                  */
/* ************************************************************************ */

test('full trajectory segment creation', () => {
  const points = trajectory.points;
  const nPoints = points.length;

  const pointEq = vector3Equals;
  const numEq = numberEqual;

  for (let i = 1; i < nPoints; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const timedSegment = trajectorySegmentsToTimedBezierCurve(
      previous,
      current
    );
    numEq(timedSegment.startTime, previous[0]);
    numEq(timedSegment.duration, current[0] - previous[0]);

    // Length equals end of prevous + intermediate control points + end of current.
    numEq(timedSegment.points.length, 1 + current[2].length + 1);
    pointEq(timedSegment.points[0], previous[1]);
    pointEq(timedSegment.points.at(-1)!, current[1]);
    for (let i = 1; i < timedSegment.points.length - 1; i++) {
      pointEq(timedSegment.points[i], current[2][i - 1]);
    }
  }
});

test('splitting a trajectory', () => {
  const eq = vector3Equals;

  const splitFractions = [0, 0.1, 0.33, 0.5, 0.75, 1];
  const trajectoryPoints = trajectory.points;
  const numPoints = trajectoryPoints.length;
  // Evaluate at every known point.
  const ts = Object.keys(expectedPositions).map((v) => Number.parseInt(v, 10));

  for (const fraction of splitFractions) {
    const points: Trajectory['points'] = [trajectoryPoints[0]];
    for (let iPoint = 1; iPoint < numPoints; iPoint++) {
      // It's okay to use the original trajectory points, because we're splitting
      // current, and only use the endpoint and time from the previous segment,
      // which remains the same.
      const [previous, current] = [
        trajectoryPoints[iPoint - 1],
        trajectoryPoints[iPoint],
      ];
      const [left, right] = splitTimedBezierCurve(
        trajectorySegmentsToTimedBezierCurve(previous, current),
        fraction
      );
      points.push(
        timedBezierCurveToTrajectorySegment(left),
        timedBezierCurveToTrajectorySegment(right)
      );
    }

    const ev = createPositionEvaluator({ ...trajectory, points });
    for (const t of ts) {
      eq(ev(t), expectedPositions[t], 1e-5, `(fraction=${fraction}, t=${t}) `);
    }
  }
});

test('splitting a trajectory at a given time', () => {
  const eq = vector3Equals;
  const time = 1;
  const trajectoryPoints = trajectory.points;
  // Evaluate at every known point.
  const ts = Object.keys(expectedPositions).map((v) => Number.parseInt(v, 10));
  const [left, right] = splitTimedBezierCurveAt(
    trajectorySegmentsToTimedBezierCurve(
      trajectoryPoints[0],
      trajectoryPoints[1]
    ),
    time
  );
  const ev = createPositionEvaluator({
    ...trajectory,
    points: [
      trajectoryPoints[0],
      timedBezierCurveToTrajectorySegment(left),
      timedBezierCurveToTrajectorySegment(right),
      ...trajectoryPoints.slice(2),
    ],
  });
  for (const t of ts) {
    eq(ev(t), expectedPositions[t], 1e-5, `(time=${time}, t=${t}) `);
  }
});

test('subtrajectory in a given time window', () => {
  const eq = vector3Equals;
  const ts = Object.keys(expectedPositions).map((v) => Number.parseInt(v, 10));
  const [startTime, duration] = [1, 2];
  const endTime = startTime + duration;
  const { takeoffTime = 0 } = trajectory;
  // The subtrajectory in the time window.
  const subTrajectory = trajectorySegmentsInTimeWindow(trajectory.points, {
    startTime,
    duration,
  });
  const ev = createPositionEvaluator({
    ...trajectory,
    // TODO: Eliminate or justify the following type assertion!
    points: subTrajectory as Trajectory['points'],
  });
  for (const t of ts.filter(
    (t) => t >= startTime + takeoffTime && t <= endTime + takeoffTime
  )) {
    eq(
      ev(t),
      expectedPositions[t],
      1e-5,
      `(startTime=${startTime + takeoffTime}, endTime=${
        endTime + takeoffTime
      }, t=${t}) `
    );
  }
});

test('sub-trajectory in time window calculation', () => {
  const eq = vector3Equals;
  const ts = Object.keys(expectedPositions).map((v) => Number.parseInt(v, 10));
  const { takeoffTime = 0 } = trajectory;

  for (let startTime = 0; startTime < 60; startTime += 1) {
    for (let endTime = startTime + 1; endTime <= 60; endTime += 1) {
      const duration = endTime - startTime;
      // The subtrajectory in the time window.
      const subTrajectory = trajectorySegmentsInTimeWindow(trajectory.points, {
        startTime,
        duration,
      });
      // Create evaluator for the sub-trajectory.
      const ev = createPositionEvaluator({
        ...trajectory,
        // TODO: Eliminate or justify the following type assertion!
        points: subTrajectory as Trajectory['points'],
      });
      for (const t of ts.filter(
        (t) => t >= startTime + takeoffTime && t <= endTime + takeoffTime
      )) {
        eq(
          ev(t),
          expectedPositions[t],
          1e-5,
          `(startTime=${startTime + takeoffTime}, endTime=${
            endTime + takeoffTime
          }, t=${t}) `
        );
      }
    }
  }
});
