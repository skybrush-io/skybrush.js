import type { Vector2PlusTuple, Vector2Tuple, Vector3Tuple } from './types.js';

/**
 * Returns the centroid of an array of points.
 */
export function getCentroid<
  C extends Vector2Tuple | Vector3Tuple | Vector2PlusTuple,
>(points: C[], dim = 2): C {
  const result: number[] = Array.from({ length: dim }, () => 0);
  const n = points && Array.isArray(points) ? points.length : 0;

  if (n === 0) {
    return result as C;
  }

  for (const point of points) {
    for (let i = 0; i < dim; i++) {
      result[i] = (result[i] ?? 0) + (point[i] ?? 0);
    }
  }

  for (let i = 0; i < dim; i++) {
    result[i] = (result[i] ?? 0) / n;
  }

  return result as C;
}
