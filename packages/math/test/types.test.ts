import {
  isVector2PlusTuple,
  isVector2Tuple,
  isVector3Tuple,
} from '../dist/types.js';
import { isQuaternionWXYZTuple } from '../src/types.js';

describe('isVector2Tuple', () => {
  test('accepts valid 2D vectors', () => {
    expect(isVector2Tuple([1, 2])).toBe(true);
  });

  test('rejects non-2D vectors', () => {
    expect(isVector2Tuple([1])).toBe(false);
    expect(isVector2Tuple([1, 2, 3])).toBe(false);
    expect(isVector2Tuple([1, '2'])).toBe(false);
    expect(isVector2Tuple({ x: 1, y: 2 })).toBe(false);
  });
});

describe('isVector2PlusTuple', () => {
  test('accepts 2D and higher-dimensional vectors', () => {
    expect(isVector2PlusTuple([1, 2])).toBe(true);
    expect(isVector2PlusTuple([1, 2, 3])).toBe(true);
  });

  test('rejects invalid coordinates', () => {
    expect(isVector2PlusTuple([1])).toBe(false);
    expect(isVector2PlusTuple([1, 2, '3'])).toBe(false);
    expect(isVector2PlusTuple('1,2')).toBe(false);
  });
});

describe('isVector3Tuple', () => {
  test('accepts valid 3D vectors', () => {
    expect(isVector3Tuple([1, 2, 3])).toBe(true);
  });

  test('rejects non-3D vectors', () => {
    expect(isVector3Tuple([1, 2])).toBe(false);
    expect(isVector3Tuple([1, 2, 3, 4])).toBe(false);
    expect(isVector3Tuple([1, 2, '3'])).toBe(false);
    expect(isVector3Tuple({ x: 1, y: 2, z: 3 })).toBe(false);
  });
});

describe('isVector3Tuple', () => {
  test('accepts valid WXYZ quaternions', () => {
    expect(isQuaternionWXYZTuple([1, 2, 3, 4])).toBe(true);
  });

  test('rejects non-WXYZ quaternions', () => {
    expect(isQuaternionWXYZTuple([1, 2])).toBe(false);
    expect(isQuaternionWXYZTuple([1, 2, 3])).toBe(false);
    expect(isQuaternionWXYZTuple([1, 2, 3, '4'])).toBe(false);
    expect(isQuaternionWXYZTuple({ x: 1, y: 2, z: 3, w: 4 })).toBe(false);
  });
});
