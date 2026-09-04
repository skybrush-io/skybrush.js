import type { Vector2, Vector2Tuple, Vector3, Vector3Tuple } from './types.js';

/**
 * Checks whether two 2D vectors are almost equal within a given epsilon.
 */
export const areVector2sAlmostEqual = (
  a: Vector2,
  b: Vector2,
  eps: number
): boolean => Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps;

/**
 * Checks whether two 2D vectors are almost equal within a given epsilon (tuple variant).
 */
export const areVector2TuplesAlmostEqual = (
  a: Vector2Tuple,
  b: Vector2Tuple,
  eps: number
): boolean => Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps;

/**
 * Checks whether two 3D vectors are almost equal within a given epsilon.
 */
export const areVector3sAlmostEqual = (
  a: Vector3,
  b: Vector3,
  eps: number
): boolean =>
  Math.abs(a.x - b.x) < eps &&
  Math.abs(a.y - b.y) < eps &&
  Math.abs(a.z - b.z) < eps;

/**
 * Checks whether two 3D vectors are almost equal within a given epsilon (tuple variant).
 */
export const areVector3TuplesAlmostEqual = (
  a: Vector3Tuple,
  b: Vector3Tuple,
  eps: number
): boolean =>
  Math.abs(a[0] - b[0]) < eps &&
  Math.abs(a[1] - b[1]) < eps &&
  Math.abs(a[2] - b[2]) < eps;

/**
 * Calculates the dot product of two 2D vector tuples given by their coordinate pairs.
 */
export const dotProduct2D = (a: Vector2Tuple, b: Vector2Tuple): number =>
  a[0] * b[0] + a[1] * b[1];

/**
 * Calculates the dot product of two 3D vector tuples given by their coordinate pairs.
 */
export const dotProduct3D = (a: Vector3Tuple, b: Vector3Tuple): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
