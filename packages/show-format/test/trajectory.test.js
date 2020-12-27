const { createTrajectoryPlayer } = require('..');
const { shuffle } = require('../lib/utils');

const test = require('ava');

const trajectory = {
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
    [54, [6, 3, 12], null],
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

const known = {
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

const createPositionEvaluator = (trajectory) => {
  const { getPositionAt } = createTrajectoryPlayer(trajectory);
  return (t) => {
    const vector = { x: 0, y: 0, z: 0 };
    getPositionAt(t, vector);
    return [vector.x, vector.y, vector.z];
  };
};

const almostEquals = (t) => (value, expected, eps = 1e-5) => {
  const message = `Points do not match, expected [${expected}], got [${value}]`;
  t.assert(Math.abs(value[0] - expected[0]) < eps, message);
  t.assert(Math.abs(value[1] - expected[1]) < eps, message);
  t.assert(Math.abs(value[2] - expected[2]) < eps, message);
};

test('trajectory evaluation, no segments', (t) => {
  const ev = createPositionEvaluator({ version: 1, points: [] });
  const eq = almostEquals(t);

  for (const t of [
    Number.NEGATIVE_INFINITY,
    -2,
    0,
    3,
    6,
    Number.POSITIVE_INFINITY,
  ]) {
    eq(ev(t), [0, 0, 0]);
  }
});

test('trajectory evaluation, segment before takeoff time', (t) => {
  const ev = createPositionEvaluator(trajectory);
  const eq = almostEquals(t);

  const ts = [-2, 0, 3, 6];
  for (const t of ts) {
    eq(ev(t), known[t]);
  }

  eq(ev(Number.NEGATIVE_INFINITY), known[ts[0]]);
});

test('trajectory evaluation, takeoff segment', (t) => {
  const ev = createPositionEvaluator(trajectory);
  const eq = almostEquals(t);

  const ts = [6, 8, 10, 12];
  for (const t of ts) {
    eq(ev(t), known[t]);
  }
});

test('trajectory evaluation, first and second curve', (t) => {
  const ev = createPositionEvaluator(trajectory);
  const eq = almostEquals(t);

  const ts = [12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 34, 36, 38, 40, 42, 44];
  for (const t of ts) {
    eq(ev(t), known[t]);
  }
});

test('trajectory evaluation, linear segment', (t) => {
  const ev = createPositionEvaluator(trajectory);
  const eq = almostEquals(t);

  const ts = [44, 50, 56];
  for (const t of ts) {
    eq(ev(t), known[t]);
  }
});

test('trajectory evaluation, jumping segment', (t) => {
  const ev = createPositionEvaluator(trajectory);
  const eq = almostEquals(t);

  const ts = [56, 57, 58, 59, 60];
  for (const t of ts) {
    eq(ev(t), known[t]);
  }
});

test('trajectory evaluation, landing segment', (t) => {
  const ev = createPositionEvaluator(trajectory);
  const eq = almostEquals(t);

  const ts = [60, 62, 64, 66];
  for (const t of ts) {
    eq(ev(t), known[t]);
  }
});

test('trajectory evaluation, segment after landing time', (t) => {
  const ev = createPositionEvaluator(trajectory);
  const eq = almostEquals(t);

  const ts = [66, 68, 75, 100];
  for (const t of ts) {
    eq(ev(t), known[t]);
  }

  eq(ev(Number.POSITIVE_INFINITY), known[ts[ts.length - 1]]);
});

test('trajectory evaluation, unsupported segment type', (t) => {
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

  t.throws(() => ev(5), { message: /supported/ });
});

test('trajectory evaluation, shuffled', (t) => {
  const ev = createPositionEvaluator(trajectory);
  const eq = almostEquals(t);

  const ts = Object.keys(known).map((x) => Number.parseInt(x, 10));

  for (let i = 0; i < 5; i++) {
    shuffle(ts);
    for (const t of ts) {
      eq(ev(t), known[t]);
    }
  }
});
