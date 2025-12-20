import { YawControl, createYawControlPlayer } from '../dist/index.js';
import { Vector3 as EulerAngles } from '../dist/types.js';
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
  const { getYawAt } = createYawControlPlayer(yawProgram);
  const vec: EulerAngles = { x: 0, y: 0, z: 0 };
  return (time: number) => {
    getYawAt(time, vec);
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
