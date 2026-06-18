import {
  polar,
  polarCCW,
  polarCCWNorth,
  polarCW,
  polarCWNorth,
  toPolar,
} from '../dist/polar.js';
import type { Degrees } from '../dist/types.js';

const deg = (value: number): Degrees => value as Degrees;

const expectPointClose = (
  actual: [number, number],
  expected: [number, number]
) => {
  expect(actual[0]).toBeCloseTo(expected[0], 10);
  expect(actual[1]).toBeCloseTo(expected[1], 10);
};

describe('polarCCW', () => {
  test('uses east as zero and increases counter-clockwise', () => {
    expectPointClose(polarCCW({ angle: 0 }), [1, 0]);
    expectPointClose(polarCCW({ angle: 90 }), [0, 1]);
  });

  test('uses the provided center and radius', () => {
    expectPointClose(
      polarCCW({ center: [2, 3], angle: 180, radius: 2 }),
      [0, 3]
    );
  });

  test('polar is an alias of polarCCW', () => {
    expect(polar).toBe(polarCCW);
  });
});

describe('polarCCWNorth', () => {
  test('uses north as zero and increases counter-clockwise', () => {
    expectPointClose(polarCCWNorth({ angle: 0 }), [0, 1]);
    expectPointClose(polarCCWNorth({ angle: 90 }), [-1, 0]);
  });
});

describe('polarCW', () => {
  test('uses east as zero and increases clockwise', () => {
    expectPointClose(polarCW({ angle: deg(0) }), [1, 0]);
    expectPointClose(polarCW({ angle: deg(90) }), [0, -1]);
  });
});

describe('polarCWNorth', () => {
  test('uses north as zero and increases clockwise', () => {
    expectPointClose(polarCWNorth({ angle: deg(0) }), [0, 1]);
    expectPointClose(
      polarCWNorth({ angle: deg(90), center: [2, 3], radius: 2 }),
      [4, 3]
    );
  });
});

describe('toPolar', () => {
  test('converts Cartesian coordinates to polar coordinates', () => {
    const [radius, angle] = toPolar([3, 4]);

    expect(radius).toBeCloseTo(5, 10);
    expect(angle).toBeCloseTo(53.13010235415598, 10);
  });

  test('normalizes negative angles into the [0, 360) range', () => {
    const [radius, angle] = toPolar([0, -1]);

    expect(radius).toBe(1);
    expect(angle).toBe(270);
  });

  test('returns zero radius and angle for the origin', () => {
    expect(toPolar([0, 0])).toEqual([0, 0]);
  });
});
