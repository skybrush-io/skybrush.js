import {
  bearing,
  degrees,
  getMeanAngle,
  radians,
  toDegrees,
  toRadians,
} from '../dist/angles.js';
import type { Degrees } from '../dist/types.js';

const deg = (value: number): Degrees => value as Degrees;

const expectAngleClose = (actual: number, expected: number) => {
  expect(actual).toBeCloseTo(expected, 10);
};

describe('toRadians', () => {
  test('converts degrees to radians', () => {
    expectAngleClose(toRadians(0), 0);
    expectAngleClose(toRadians(90), Math.PI / 2);
    expectAngleClose(toRadians(180), Math.PI);
  });

  test('degrees is an alias of toRadians', () => {
    expect(degrees).toBe(toRadians);
    expectAngleClose(degrees(270), (3 * Math.PI) / 2);
  });
});

describe('toDegrees', () => {
  test('converts radians to degrees', () => {
    expectAngleClose(toDegrees(0), 0);
    expectAngleClose(toDegrees(Math.PI / 2), 90);
    expectAngleClose(toDegrees(Math.PI), 180);
  });

  test('radians is an alias of toDegrees', () => {
    expect(radians).toBe(toDegrees);
    expectAngleClose(radians((3 * Math.PI) / 2), 270);
  });
});

describe('bearing', () => {
  test('uses north as zero and increases clockwise', () => {
    const origin: [number, number] = [0, 0];

    expectAngleClose(bearing(origin, [0, 1]), 0);
    expectAngleClose(bearing(origin, [1, 0]), Math.PI / 2);
    expectAngleClose(bearing(origin, [0, -1]), Math.PI);
    expectAngleClose(bearing(origin, [-1, 0]), -Math.PI / 2);
  });

  test('depends on the relative displacement between the two points', () => {
    expectAngleClose(bearing([2, 3], [3, 4]), Math.PI / 4);
  });
});

describe('getMeanAngle', () => {
  test('returns zero for an empty list', () => {
    expect(getMeanAngle([])).toBe(0);
  });

  test('returns the mean angle for a simple cluster', () => {
    expectAngleClose(getMeanAngle([deg(10), deg(20), deg(30)]), 20);
  });

  test('handles wrap-around across zero degrees', () => {
    expectAngleClose(getMeanAngle([deg(350), deg(10)]) % 360, 0);
  });

  test('normalizes negative mean angles into the [0, 360) range', () => {
    const angle = getMeanAngle([deg(300), deg(330)]);

    expectAngleClose(angle, 315);
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThan(360);
  });
});
