import { getCentroid } from '../dist/centroid.js';
import type { Vector2Tuple } from '../dist/types.js';

describe('getCentroid', () => {
  test('returns the centroid of 2D points', () => {
    expect(
      getCentroid([
        [0, 0],
        [2, 4],
        [4, 8],
      ])
    ).toEqual([2, 4]);
  });

  test('returns a zero vector for an empty or invalid point list', () => {
    expect(getCentroid([])).toEqual([0, 0]);
    expect(getCentroid([], 3)).toEqual([0, 0, 0]);
    expect(getCentroid(null as unknown as Vector2Tuple[])).toEqual([0, 0]);
  });

  test('supports higher-dimensional points when dim is provided', () => {
    const points = [
      [0, 0, 0],
      [2, 4, 6],
    ] as unknown as Vector2Tuple[];

    expect(getCentroid(points, 3)).toEqual([1, 2, 3]);
  });

  test('treats missing coordinates beyond the tuple length as zero', () => {
    expect(
      getCentroid(
        [
          [2, 4],
          [4, 6],
        ],
        3
      )
    ).toEqual([3, 5, 0]);
  });
});
