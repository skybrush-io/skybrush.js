import { minBy, range } from 'lodash-es';
import { err, ok, type Result } from 'neverthrow';

import { length2D } from './distances.js';
import {
  isVector2PlusTuple,
  isVector2Tuple,
  type Vector2PlusTuple,
  type Vector2Tuple,
} from './types.js';
import { dotProduct2D } from './vectors.js';

/**
 * Takes a polygon (i.e. an array of [x, y] coordinate pairs) and ensures that
 * it is closed in a way OpenLayers likes it, i.e. the last element is equal to
 * the first.
 */
export function closePolygon(poly: Vector2PlusTuple[]): void {
  if (!Array.isArray(poly) || poly.length < 2) {
    return;
  }

  const firstPoint = poly.at(0);
  const lastPoint = poly.at(-1);

  if (!isVector2PlusTuple(firstPoint) || !isVector2PlusTuple(lastPoint)) {
    return;
  }

  const dim = firstPoint.length;
  let shouldClose = true;

  if (dim === lastPoint.length) {
    shouldClose = false;
    for (let i = 0; i < dim; i++) {
      if (firstPoint[i] !== lastPoint[i]) {
        shouldClose = true;
        break;
      }
    }
  }

  if (shouldClose) {
    poly.push(firstPoint);
  }
}

/**
 * Given five vertices, remove the middle one (c) and move the second (b) and
 * fourth (d) in a way that the original area is still covered.
 * The transformation essentially slides (b) along the (ab) line and (d) along
 * the (ed) line extending them until the new (bd) line "touches" (c).
 */
const adjustAndRemoveMiddleVertex = (
  a: Vector2Tuple,
  b: Vector2Tuple,
  c: Vector2Tuple,
  d: Vector2Tuple,
  e: Vector2Tuple
): [Vector2Tuple, Vector2Tuple, Vector2Tuple, Vector2Tuple] => {
  const getNormal = (p: Vector2Tuple, q: Vector2Tuple): Vector2Tuple => [
    p[1] - q[1],
    q[0] - p[0],
  ];

  const leftNormal = getNormal(a, b);
  const centerNormal = getNormal(b, d);
  const rightNormal = getNormal(d, e);

  const leftConstant = dotProduct2D(leftNormal, a);
  const centerConstant = dotProduct2D(centerNormal, c);
  const rightConstant = dotProduct2D(rightNormal, e);

  // lNx lNy [ nBx ] = lC
  // cNx cNy [ nBy ] = cC

  const determinantLeft =
    leftNormal[0] * centerNormal[1] - leftNormal[1] * centerNormal[0];

  const determinantRight =
    rightNormal[0] * centerNormal[1] - rightNormal[1] * centerNormal[0];

  // nBx =  cNy -lNy [ lC ]
  // nBy = -cNx  lNx [ cC ]

  const newB: Vector2Tuple = [
    (centerNormal[1] * leftConstant - leftNormal[1] * centerConstant) /
      determinantLeft,
    (-centerNormal[0] * leftConstant + leftNormal[0] * centerConstant) /
      determinantLeft,
  ];

  const newD: Vector2Tuple = [
    (centerNormal[1] * rightConstant - rightNormal[1] * centerConstant) /
      determinantRight,
    (-centerNormal[0] * rightConstant + rightNormal[0] * centerConstant) /
      determinantRight,
  ];

  return [a, newB, newD, e];
};

/**
 * Calculate the amount of rotation at the corner formed by the three points.
 */
const turnAngle = (
  a: Vector2Tuple,
  b: Vector2Tuple,
  c: Vector2Tuple
): number => {
  const u: Vector2Tuple = [b[0] - a[0], b[1] - a[1]];
  const v: Vector2Tuple = [c[0] - b[0], c[1] - b[1]];

  return Math.acos(dotProduct2D(u, v) / (length2D(u) * length2D(v)));
};

/**
 * Simplify a polygon given by its list of coordinates by continously removing
 * the vertices with the lowest surrounding turning rotations (equivalently, the
 * highest surrounding internal angles) and adjusting their neighbors until a
 * desired limit is reached.
 *
 * Neighboring vertices in the polygon are adjusted in a way that the new
 * (simplified) polygon will always fully contain the original polygon.
 *
 * @param coordinates - The list of coordinates of the polygon to simplify.
 * @param limit - The maximum number of vertices to keep in the simplified polygon.
 *        Must be at least 3. When it is less than 3, it is assumed to be equal to 3
 *        instead.
 */
export const simplifyPolygonUntilLimit = (
  coordinates: Vector2Tuple[],
  limit: number
): Vector2Tuple[] => {
  if (limit < 3) {
    limit = 3;
  }

  if (coordinates.length <= limit) {
    return coordinates;
  }

  const getCoordinate = (i: number): Vector2Tuple =>
    // NOTE: Bang justified by remainder operation and `coordinates.length >= 3`
    coordinates.at(i % coordinates.length)!;

  const setCoordinate = (i: number, v: Vector2Tuple): void => {
    coordinates[(i + coordinates.length) % coordinates.length] = v;
  };

  const getAngleAt = (i: number): number =>
    turnAngle(getCoordinate(i - 1), getCoordinate(i), getCoordinate(i + 1));

  // NOTE: Bang justified by return if `coordinates.length <= 3`
  const minAnglePosition = minBy(range(coordinates.length), getAngleAt)!;
  const updated = adjustAndRemoveMiddleVertex(
    getCoordinate(minAnglePosition - 2),
    getCoordinate(minAnglePosition - 1),
    getCoordinate(minAnglePosition),
    getCoordinate(minAnglePosition + 1),
    getCoordinate(minAnglePosition + 2)
  );
  setCoordinate(minAnglePosition - 2, updated[0]);
  setCoordinate(minAnglePosition - 1, updated[1]);
  setCoordinate(minAnglePosition + 1, updated[2]);
  setCoordinate(minAnglePosition + 2, updated[3]);

  coordinates.splice(minAnglePosition, 1);

  return simplifyPolygonUntilLimit(coordinates, limit);
};

/**
 * Auxiliary wrapper function for simplifyPolygonUntilLimit that makes it
 * compatible with the OpenLayers style coordinate lists where the first and
 * last vertices are duplicates of each other.
 */
export const simplifyPolygon = <C extends Vector2Tuple>(
  [_, ...coordinates]: C[],
  target: number
): Result<C[], string> => {
  const result = simplifyPolygonUntilLimit(coordinates, target);

  if (!isVector2Tuple(result[0])) {
    return err('polygons need to have at least three 2D vertices');
  }

  // NOTE: Type assertion justified by `simplifyPolygonUntilLimit`
  //       returning coordinates of the same type as were passed.
  return ok([...result, result[0]] as C[]);
};
