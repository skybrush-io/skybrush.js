import type { Degrees, Radians, Vector2Tuple } from './types.js';

/**
 * Returns the given number of degrees in radians.
 *
 * @param x - The degrees to convert
 * @returns The converted degrees in radians
 */
export function toRadians(x: number): Radians {
  return ((x * Math.PI) / 180) as Radians;
}

export const degrees = toRadians;

/**
 * Returns the given number of radians in degrees.
 *
 * @param x - The radians to convert
 * @returns The converted radians in degrees
 */
export function toDegrees(x: number): Degrees {
  return ((x * 180) / Math.PI) as Degrees;
}

export const radians = toDegrees;

/**
 * Calculate the bearing from one point to another, assuming that zero bearing points
 * North (i.e. towards the positive Y axis) and that the bearing increases clockwise.
 */
export const bearing = (p: Vector2Tuple, q: Vector2Tuple): Radians =>
  (Math.PI / 2 - Math.atan2(q[1] - p[1], q[0] - p[0])) as Radians;

/**
 * Returns the mean angle of an array of angles, specified in degrees.
 *
 * The returned angle will be in the range [0; 360).
 */
export function getMeanAngle(angles: Degrees[]): Degrees {
  const centroid: Vector2Tuple = [0, 0];
  for (const angle of angles.map(toRadians)) {
    centroid[0] += Math.cos(angle);
    centroid[1] += Math.sin(angle);
  }

  // Works with centroid = [0, 0] as Math.atan2(0, 0) is 0.
  const result = toDegrees(Math.atan2(centroid[1], centroid[0]));
  return (result < 0 ? result + 360 : result) as Degrees;
}
