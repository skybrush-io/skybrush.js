import type { YawControl} from '../dist/index.js';
import { createYawControlPlayer } from '../dist/index.js';
import type { Vector3 as EulerAngles } from '../dist/types.js';
import { shuffle } from '../dist/utils.js';

const yaw: YawControl = {
  version: 1,
  setpoints: [
    [0, 0],
    [10, 0],
    [20, 360],
    [50, -720],
    [70, 0],
  ],
};

const almostEquals = (value: number, expected: number, eps = 1e-5) => {
  const valueInDeg = value * (180 / Math.PI);
  expect(Math.abs(valueInDeg - expected)).toBeLessThan(eps);
};

/* ************************************************************************ */
/* Tests related to evaluating the desired yaw at a given point             */
/* ************************************************************************ */

const expectedPositions: Record<number, number> = {
  [-2]: 0,
  0: 0,
  3: 0,
  6: 0,
  10: 0,
  12: 72,
  14: 144,
  15: 180,
  16: 216,
  18: 288,
  20: 360,
  22: 288,
  24: 216,
  25: 180,
  26: 144,
  28: 72,
  30: 0,
  32: -72,
  34: -144,
  35: -180,
  36: -216,
  38: -288,
  40: -360,
  42: -432,
  44: -504,
  45: -540,
  46: -576,
  48: -648,
  50: -720,
  52: -648,
  54: -576,
  55: -540,
  56: -504,
  58: -432,
  60: -360,
  62: -288,
  64: -216,
  65: -180,
  66: -144,
  68: -72,
  70: 0,
};

const createYawEvaluator = (yawProgram: YawControl) => {
  const { getPoseAt } = createYawControlPlayer(yawProgram);
  const vec: EulerAngles = { x: 0, y: 0, z: 0 };
  return (time: number) => {
    getPoseAt(time, vec);
    return vec.z;
  };
};

test('yaw evaluation, no segments', () => {
  const ev = createYawEvaluator({ version: 1, setpoints: [] });
  const eq = almostEquals;

  for (const t of [
    Number.NEGATIVE_INFINITY,
    -2,
    0,
    3,
    6,
    Number.POSITIVE_INFINITY,
  ]) {
    eq(ev(t), 0);
  }
});

test('yaw evaluation, constant segment', () => {
  const ev = createYawEvaluator(yaw);
  const eq = almostEquals;

  const ts = [-2, 0, 3, 6, 10];
  for (const t of ts) {
    eq(ev(t), expectedPositions[t]);
  }
});

test('yaw evaluation, linear segment', () => {
  const ev = createYawEvaluator(yaw);
  const eq = almostEquals;

  const ts = [10, 12, 14, 15, 16, 18, 20, 30, 40, 50, 60, 70];
  for (const t of ts) {
    eq(ev(t), expectedPositions[t]);
  }

  eq(ev(Number.NEGATIVE_INFINITY), expectedPositions[ts[0]]);
});

test('yaw evaluation, shuffled', () => {
  const ev = createYawEvaluator(yaw);
  const eq = almostEquals;

  const ts = Object.keys(expectedPositions).map((x) => Number.parseInt(x, 10));

  for (let i = 0; i < 5; i++) {
    shuffle(ts);
    for (const t of ts) {
      eq(ev(t), expectedPositions[t]);
    }
  }
});

test('deprecated getYawAt() warns once and delegates to getPoseAt()', () => {
  const { getPoseAt, getYawAt } = createYawControlPlayer(yaw);
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  const vecA: EulerAngles = { x: 0, y: 0, z: 0 };
  const vecB: EulerAngles = { x: 0, y: 0, z: 0 };

  getYawAt(12, vecA);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn).toHaveBeenCalledWith(
    'getYawAt() is deprecated. Use getPoseAt() instead.'
  );

  getYawAt(20, vecB);
  expect(warn).toHaveBeenCalledTimes(1);

  // Results must still match the non-deprecated function
  for (const t of [12, 20]) {
    const expected: EulerAngles = { x: 0, y: 0, z: 0 };
    getPoseAt(t, expected);
    expect(t === 12 ? vecA : vecB).toEqual(expected);
  }

  warn.mockRestore();
});

/* ************************************************************************ */
/* Tests related to evaluating the desired yaw at multiple given points    */
/* ************************************************************************ */

test('yaw evaluation at multiple points, no segments', () => {
  const { getPosesAt } = createYawControlPlayer({ version: 1, setpoints: [] });
  const result = new Float32Array(3 * 2);

  getPosesAt(
    [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
    result
  );

  for (const value of result) {
    expect(value).toBe(0);
  }
});

test('yaw evaluation at multiple points, matches getPoseAt()', () => {
  const { getPoseAt, getPosesAt } = createYawControlPlayer(yaw);

  const ts = Object.keys(expectedPositions).map((x) => Number.parseInt(x, 10));
  shuffle(ts);

  const result = new Float32Array(3 * ts.length);
  getPosesAt(ts, result);

  const vec: EulerAngles = { x: 0, y: 0, z: 0 };
  ts.forEach((t, i) => {
    getPoseAt(t, vec);

    // Only the Z component is used by yaw control; X and Y must be left
    // untouched by the evaluator
    // Values are stored in a Float32Array, so we need a slightly larger
    // tolerance than for the double-precision evaluation functions
    expect(result[3 * i]).toBe(0);
    expect(result[3 * i + 1]).toBe(0);
    almostEquals(result[3 * i + 2], expectedPositions[t], 1e-3);
    almostEquals(result[3 * i + 2], (vec.z * 180) / Math.PI, 1e-3);
  });
});

test('pose coordinate evaluation, matches getPoseAt()', () => {
  const { getPoseAt, getPoseCoordinateAt } = createYawControlPlayer(yaw);

  const ts = Object.keys(expectedPositions).map((x) => Number.parseInt(x, 10));
  shuffle(ts);

  const vec: EulerAngles = { x: 0, y: 0, z: 0 };
  for (const t of ts) {
    getPoseAt(t, vec);

    expect(getPoseCoordinateAt(t, 'x')).toBe(vec.x);
    expect(getPoseCoordinateAt(t, 'y')).toBe(vec.y);
    expect(getPoseCoordinateAt(t, 'z')).toBe(vec.z);
  }
});

test('pose coordinate evaluation at multiple points, matches getPosesAt()', () => {
  const { getPosesAt, getPoseCoordinatesAt } = createYawControlPlayer(yaw);

  const ts = Object.keys(expectedPositions).map((x) => Number.parseInt(x, 10));
  shuffle(ts);

  const expected = new Float32Array(3 * ts.length);
  getPosesAt(ts, expected);

  const keyToOffset = { x: 0, y: 1, z: 2 } as const;
  for (const key of ['x', 'y', 'z'] as const) {
    const result = new Float32Array(ts.length);
    getPoseCoordinatesAt(ts, key, result);

    ts.forEach((_, i) => {
      expect(result[i]).toBe(expected[3 * i + keyToOffset[key]]);
    });
  }
});

test('pose coordinate evaluation at multiple points, stride options', () => {
  const { getPoseCoordinatesAt } = createYawControlPlayer(yaw);

  const ts = [0, 12, 20, 40, 70];
  const stride = 3;
  const start = 1;
  const result = new Float32Array(start + stride * (ts.length - 1) + 1);

  getPoseCoordinatesAt(ts, 'z', result, { start, step: stride });

  ts.forEach((t, i) => {
    almostEquals(result[start + stride * i], expectedPositions[t], 1e-3);
  });

  // Values outside the strided slots must be left untouched
  expect(result[0]).toBe(0);
  for (const index of [2, 5, 8, 11]) {
    expect(result[index]).toBe(0);
  }
});

test('deprecated getYawsAt() warns once and delegates to getPosesAt()', () => {
  const { getPosesAt, getYawsAt } = createYawControlPlayer(yaw);
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  const ts = [0, 12, 20, 40, 70];
  const resultA = new Float32Array(3 * ts.length);
  const resultB = new Float32Array(3 * ts.length);

  getYawsAt(ts, resultA);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn).toHaveBeenCalledWith(
    'getYawsAt() is deprecated. Use getPosesAt() instead.'
  );

  getYawsAt(ts, resultB);
  expect(warn).toHaveBeenCalledTimes(1);

  // Results must still match the non-deprecated function
  const resultC = new Float32Array(3 * ts.length);
  getPosesAt(ts, resultC);
  expect(Array.from(resultA)).toEqual(Array.from(resultC));
  expect(Array.from(resultB)).toEqual(Array.from(resultC));

  warn.mockRestore();
});

test('yaw evaluation at multiple points, stride options', () => {
  const { getPosesAt } = createYawControlPlayer(yaw);

  const ts = [0, 12, 20, 40, 70];
  const stride = 4;
  const start = 2;
  const result = new Float32Array(start + stride * (ts.length - 1) + 3);

  getPosesAt(ts, result, { start, step: stride });

  ts.forEach((t, i) => {
    const offset = start + stride * i;

    expect(result[offset]).toBe(0);
    expect(result[offset + 1]).toBe(0);
    almostEquals(result[offset + 2], expectedPositions[t], 1e-3);
  });

  // Values outside the strided slots must be left untouched
  expect(result[0]).toBe(0);
  expect(result[1]).toBe(0);
  for (const index of [3, 6, 7, 10, 11, 14, 15]) {
    expect(result[index]).toBe(0);
  }
});

/* ************************************************************************ */
/* Tests related to evaluating the yaw angular velocity at a given point    */
/* ************************************************************************ */

const expectedVelocities: Record<number, number> = {
  [-2]: 0,
  0: 0,
  3: 0,
  6: 0,
  10: 36,
  12: 36,
  14: 36,
  15: 36,
  16: 36,
  18: 36,
  20: -36,
  22: -36,
  24: -36,
  25: -36,
  26: -36,
  28: -36,
  30: -36,
  32: -36,
  34: -36,
  35: -36,
  36: -36,
  38: -36,
  40: -36,
  42: -36,
  44: -36,
  45: -36,
  46: -36,
  48: -36,
  50: 36,
  52: 36,
  54: 36,
  55: 36,
  56: 36,
  58: 36,
  60: 36,
  62: 36,
  64: 36,
  65: 36,
  66: 36,
  68: 36,
  70: 0,
};

const createVelocityEvaluator = (yawProgram: YawControl) => {
  const { getAngularVelocityAt } = createYawControlPlayer(yawProgram);
  const vec: EulerAngles = { x: 0, y: 0, z: 0 };
  return (time: number) => {
    getAngularVelocityAt(time, vec);
    return vec.z;
  };
};

test('yaw angular velocity evaluation, no segments', () => {
  const ev = createVelocityEvaluator({ version: 1, setpoints: [] });
  const eq = almostEquals;

  for (const t of [
    Number.NEGATIVE_INFINITY,
    -2,
    0,
    3,
    6,
    Number.POSITIVE_INFINITY,
  ]) {
    eq(ev(t), 0);
  }
});

test('yaw angular velocity evaluation, constant segment', () => {
  const ev = createVelocityEvaluator(yaw);
  const eq = almostEquals;

  const ts = [-2, 0, 3, 6, 10];
  for (const t of ts) {
    eq(ev(t), expectedVelocities[t]);
  }

  eq(ev(Number.NEGATIVE_INFINITY), expectedVelocities[ts[0]]);
});

test('yaw angular velocity evaluation, linear segment', () => {
  const ev = createVelocityEvaluator(yaw);
  const eq = almostEquals;

  const ts = [10, 12, 14, 15, 16, 18, 20, 30, 40, 50, 60, 70];
  for (const t of ts) {
    eq(ev(t), expectedVelocities[t]);
  }
});

test('yaw angular velocity evaluation, shuffled', () => {
  const ev = createVelocityEvaluator(yaw);
  const eq = almostEquals;

  const ts = Object.keys(expectedVelocities).map((x) => Number.parseInt(x, 10));

  for (let i = 0; i < 5; i++) {
    shuffle(ts);
    for (const t of ts) {
      eq(ev(t), expectedVelocities[t]);
    }
  }
});

/* ************************************************************************ */
/* Tests related to evaluating the yaw angular velocity at multiple       */
/* given points                                                             */
/* ************************************************************************ */

test('yaw angular velocity evaluation at multiple points, matches getAngularVelocityFromRightAt()', () => {
  const { getAngularVelocityFromRightAt, getAngularVelocitiesFromRightAt } =
    createYawControlPlayer(yaw);

  const ts = Object.keys(expectedVelocities).map((x) =>
    Number.parseInt(x, 10)
  );
  shuffle(ts);

  const result = new Float32Array(3 * ts.length);
  getAngularVelocitiesFromRightAt(ts, result);

  const vec: EulerAngles = { x: 0, y: 0, z: 0 };
  ts.forEach((t, i) => {
    getAngularVelocityFromRightAt(t, vec);

    // Only the Z component is used by yaw control; X and Y must be left
    // untouched by the evaluator. Values are stored in a Float32Array, so we
    // need a slightly larger tolerance than for the double-precision
    // evaluation functions.
    expect(result[3 * i]).toBe(0);
    expect(result[3 * i + 1]).toBe(0);
    almostEquals(result[3 * i + 2], expectedVelocities[t], 1e-3);
    almostEquals(result[3 * i + 2], (vec.z * 180) / Math.PI, 1e-3);
  });
});

test('yaw angular velocity evaluation at multiple points, stride options', () => {
  const { getAngularVelocitiesFromRightAt } = createYawControlPlayer(yaw);

  const ts = [0, 12, 20, 40, 70];
  const stride = 4;
  const start = 2;
  const result = new Float32Array(start + stride * (ts.length - 1) + 3);

  getAngularVelocitiesFromRightAt(ts, result, { start, step: stride });

  ts.forEach((t, i) => {
    const offset = start + stride * i;

    expect(result[offset]).toBe(0);
    expect(result[offset + 1]).toBe(0);
    almostEquals(result[offset + 2], expectedVelocities[t], 1e-3);
  });

  // Values outside the strided slots must be left untouched
  expect(result[0]).toBe(0);
  expect(result[1]).toBe(0);
  for (const index of [3, 6, 7, 10, 11, 14, 15]) {
    expect(result[index]).toBe(0);
  }
});

test('getAngularVelocitiesAt() is an alias of getAngularVelocitiesFromRightAt()', () => {
  const { getAngularVelocitiesAt, getAngularVelocitiesFromRightAt } =
    createYawControlPlayer(yaw);

  const ts = [0, 12, 20, 40, 70];
  const resultA = new Float32Array(3 * ts.length);
  const resultB = new Float32Array(3 * ts.length);

  getAngularVelocitiesAt(ts, resultA);
  getAngularVelocitiesFromRightAt(ts, resultB);

  expect(Array.from(resultA)).toEqual(Array.from(resultB));
});
