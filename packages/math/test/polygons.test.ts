import {
  closePolygon,
  simplifyPolygon,
  simplifyPolygonUntilLimit,
} from '../dist/polygons.js';
import type { Vector2PlusTuple, Vector2Tuple } from '../dist/types.js';

describe('closePolygon', () => {
  test('appends the first point when the polygon is open', () => {
    const polygon: Vector2PlusTuple[] = [
      [0, 0],
      [2, 0],
      [2, 2],
    ];

    closePolygon(polygon);

    expect(polygon).toEqual([
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 0],
    ]);
  });

  test('leaves an already closed polygon unchanged', () => {
    const polygon: Vector2PlusTuple[] = [
      [0, 0, 1],
      [2, 0, 2],
      [0, 0, 1],
    ];

    closePolygon(polygon);

    expect(polygon).toEqual([
      [0, 0, 1],
      [2, 0, 2],
      [0, 0, 1],
    ]);
  });

  test('ignores polygons that are too short or invalid', () => {
    const shortPolygon: Vector2PlusTuple[] = [[0, 0]];
    const invalidPolygon = [[0, 0], 'bad'] as unknown as Vector2PlusTuple[];

    closePolygon(shortPolygon);
    closePolygon(invalidPolygon);

    expect(shortPolygon).toEqual([[0, 0]]);
    expect(invalidPolygon).toEqual([[0, 0], 'bad']);
  });
});

describe('simplifyPolygonUntilLimit', () => {
  test('returns the original coordinates when they are already within the limit', () => {
    const coordinates: Vector2Tuple[] = [
      [0, 0],
      [2, 0],
      [0, 2],
    ];

    expect(simplifyPolygonUntilLimit(coordinates, 3)).toBe(coordinates);
  });

  test('removes the least significant vertex until the desired limit is reached', () => {
    const coordinates: Vector2Tuple[] = [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ];

    expect(simplifyPolygonUntilLimit(coordinates, 4)).toEqual([
      [0, 0],
      [2, -0],
      [2, 2],
      [0, 2],
    ]);
  });

  test('treats limits less than 3 as 3', () => {
    const coordinates: Vector2Tuple[] = [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ];

    expect(simplifyPolygonUntilLimit(coordinates, 2)).toEqual([
      [2, -2],
      [2, 2],
      [-2, 2],
    ]);
  });
});

describe('simplifyPolygon', () => {
  test('returns an error when there are not enough vertices', () => {
    const result = simplifyPolygon([[0, 0]], 3);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBe(
        'polygons need to have at least three 2D vertices'
      );
    }
  });

  test('returns a closed simplified polygon on success', () => {
    const result = simplifyPolygon(
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 2],
        [0, 2],
        [0, 0],
      ],
      4
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual([
        [2, -0],
        [2, 2],
        [0, 2],
        [0, 0],
        [2, -0],
      ]);
    }
  });
});
