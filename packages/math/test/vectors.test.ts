import { dotProduct2D } from '../dist/vectors.js';

describe('dotProduct2D', () => {
  test('calculates the dot product of two 2D vectors', () => {
    expect(dotProduct2D([1, 2], [3, 4])).toBe(11);
  });

  test('returns zero for orthogonal vectors', () => {
    expect(dotProduct2D([1, 0], [0, 1])).toBe(0);
  });

  test('handles negative coordinates', () => {
    expect(dotProduct2D([-2, 5], [4, -3])).toBe(-23);
  });

  test('is commutative', () => {
    expect(dotProduct2D([2, -1], [5, 3])).toBe(dotProduct2D([5, 3], [2, -1]));
  });
});
