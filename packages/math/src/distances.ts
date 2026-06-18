import { identity, min } from 'lodash-es';

import type { Vector2PlusTuple, Vector2Tuple } from './types.js';

export type DistanceCalculationOptions<T, U = Vector2Tuple> = {
  distanceFunction: (a: U, b: U) => number;
  getter?: (item: T) => U;
};

/**
 * Calculate the length of a two dimensional vector.
 */
export const length2D = ([x, y]: Vector2Tuple): number => Math.hypot(x, y);

/**
 * Create a distance matrix between two arrays.
 */
export function calculateDistanceMatrix<T, U = Vector2Tuple>(
  sources: T[],
  targets: T[],
  { distanceFunction, getter = identity }: DistanceCalculationOptions<T, U>
): number[][] {
  const sourcePositions = sources.map(getter);
  const targetPositions = targets.map(getter);

  return sourcePositions.map((source) =>
    targetPositions.map((target) => distanceFunction(source, target))
  );
}

/**
 * Calculates the minimum distance between all pairs formed from the given
 * source and target points. The diagonal items of the distance matrix are
 * ignored if the same set of points is provided as sources and targets.
 */
export function calculateMinimumDistanceBetweenPairs<T, U = Vector2Tuple>(
  sources: T[],
  targets: T[],
  options: DistanceCalculationOptions<T, U>
): number {
  // PERF: This is probably not the most efficient algorithm as it is O(n*m)
  // but since we are not going to do this multiple times it's probably okay.
  // Improve this when the time comes.

  const distanceMatrix = calculateDistanceMatrix(sources, targets, options);

  const distances =
    sources === targets
      ? distanceMatrix.flatMap((row, i) => row.filter((_, j) => i !== j))
      : distanceMatrix.flat();

  // Do not use Math.min() here -- it fails if the distance matrix is large,
  // which may happen for thousands of drones.
  return min(distances) ?? Number.POSITIVE_INFINITY;
}

/**
 * Euclidean distance function between two points, restricted to two dimensions.
 */
export const euclideanDistance2D = (
  a: Vector2PlusTuple,
  b: Vector2PlusTuple
): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

/**
 * Calculates the squared Euclidean distance between two points, restricted to two dimensions.
 */
export const squaredEuclideanDistance2D = (
  a: Vector2PlusTuple,
  b: Vector2PlusTuple
): number => Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
