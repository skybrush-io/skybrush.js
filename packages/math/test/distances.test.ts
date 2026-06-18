import {
  calculateDistanceMatrix,
  calculateMinimumDistanceBetweenPairs,
  euclideanDistance2D,
  length2D,
  squaredEuclideanDistance2D,
} from '../dist/distances.js';
import type { Vector2Tuple } from '../dist/types.js';

describe('length2D', () => {
  test('calculates the length of a 2D vector', () => {
    expect(length2D([3, 4])).toBe(5);
  });

  test('handles negative coordinates', () => {
    expect(length2D([-3, 4])).toBe(5);
  });
});

describe('calculateDistanceMatrix', () => {
  test('creates a distance matrix using the default getter', () => {
    expect(
      calculateDistanceMatrix(
        [
          [0, 0],
          [1, 1],
        ],
        [
          [2, 0],
          [0, 2],
        ],
        { distanceFunction: squaredEuclideanDistance2D }
      )
    ).toEqual([
      [4, 4],
      [2, 2],
    ]);
  });

  test('uses the getter when provided', () => {
    const sources = [
      { id: 'a', point: [0, 0] as [number, number] },
      { id: 'b', point: [3, 4] as [number, number] },
    ];
    const targets = [{ id: 'c', point: [0, 4] as [number, number] }];

    expect(
      calculateDistanceMatrix(sources, targets, {
        distanceFunction: euclideanDistance2D,
        getter: (item) => item.point,
      })
    ).toEqual([[4], [3]]);
  });
});

describe('calculateMinimumDistanceBetweenPairs', () => {
  test('returns the minimum distance between different source and target sets', () => {
    expect(
      calculateMinimumDistanceBetweenPairs(
        [
          [0, 0],
          [10, 10],
        ],
        [
          [3, 4],
          [20, 20],
        ],
        { distanceFunction: euclideanDistance2D }
      )
    ).toBe(5);
  });

  test('ignores diagonal items when sources and targets are the same array', () => {
    const points: Vector2Tuple[] = [
      [0, 0],
      [3, 4],
      [20, 20],
    ];

    expect(
      calculateMinimumDistanceBetweenPairs(points, points, {
        distanceFunction: euclideanDistance2D,
      })
    ).toBe(5);
  });

  test('returns positive infinity when there are no eligible pairs', () => {
    expect(
      calculateMinimumDistanceBetweenPairs([], [], {
        distanceFunction: euclideanDistance2D,
      })
    ).toBe(Number.POSITIVE_INFINITY);

    const point: Vector2Tuple[] = [[1, 2]];

    expect(
      calculateMinimumDistanceBetweenPairs(point, point, {
        distanceFunction: euclideanDistance2D,
      })
    ).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('euclideanDistance2D', () => {
  test('calculates Euclidean distance in two dimensions', () => {
    expect(euclideanDistance2D([1, 2], [4, 6])).toBe(5);
  });

  test('ignores additional dimensions', () => {
    expect(euclideanDistance2D([0, 0, 100], [3, 4, -100])).toBe(5);
  });
});

describe('squaredEuclideanDistance2D', () => {
  test('calculates squared Euclidean distance in two dimensions', () => {
    expect(squaredEuclideanDistance2D([1, 2], [4, 6])).toBe(25);
  });

  test('ignores additional dimensions', () => {
    expect(squaredEuclideanDistance2D([0, 0, 100], [3, 4, -100])).toBe(25);
  });
});
