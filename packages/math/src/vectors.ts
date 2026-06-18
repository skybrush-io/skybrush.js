import type { Vector2Tuple } from './types.js';

/**
 * Calculates the dot product of two 2D vectors given by their coordinate pairs.
 */
export const dotProduct2D = (a: Vector2Tuple, b: Vector2Tuple): number =>
  a[0] * b[0] + a[1] * b[1];
