import monotoneConvexHull2D from 'monotone-convex-hull-2d';

import type { Vector2Tuple } from './types.js';

/**
 * Returns the 2D convex hull of a set of coordinates.
 */
export const convexHull2D = <C extends Vector2Tuple>(coordinates: C[]): C[] =>
  // NOTE: Bang justified by `monotoneConvexHull2D` returning an index subset
  monotoneConvexHull2D(coordinates).map((index) => coordinates[index]);
