import { convexHull2D } from '../dist/convex-hull.js';

describe('convexHull2D', () => {
  test('returns an empty hull for no coordinates', () => {
    expect(convexHull2D([])).toEqual([]);
  });

  test('returns the same single point for a one-point input', () => {
    expect(convexHull2D([[1, 2]])).toEqual([[1, 2]]);
  });

  test('returns only the endpoints for collinear points', () => {
    expect(
      convexHull2D([
        [0, 0],
        [1, 0],
        [2, 0],
      ])
    ).toEqual([
      [0, 0],
      [2, 0],
    ]);
  });

  test('excludes interior points from the hull', () => {
    expect(
      convexHull2D([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0.5, 0.5],
      ])
    ).toEqual([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ]);
  });
});
