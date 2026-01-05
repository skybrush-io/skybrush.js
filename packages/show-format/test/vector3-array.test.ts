import Vector3Array from '../dist/vector3-array.js';

describe('Vector3Array', () => {
  test('constructor allocates buffer and length', () => {
    const v = new Vector3Array(4);
    expect(v.length).toBe(4);
    expect(v.buffer.byteLength).toBe(4 * 3 * 4);
  });

  test('set and get work for various indices', () => {
    const v = new Vector3Array(3);
    v.set(0, { x: 1, y: 2, z: 3 });
    v.set(1, { x: 4, y: 5, z: 6 });
    v.set(2, { x: -1, y: -2, z: -3 });

    expect(v.get(0)).toEqual({ x: 1, y: 2, z: 3 });
    expect(v.get(1)).toEqual({ x: 4, y: 5, z: 6 });
    expect(v.get(2)).toEqual({ x: -1, y: -2, z: -3 });
  });

  test('at supports negative indices and out-of-range returns undefined', () => {
    const v = new Vector3Array(3);
    v.set(0, { x: 10, y: 20, z: 30 });
    v.set(1, { x: 11, y: 21, z: 31 });
    v.set(2, { x: 12, y: 22, z: 32 });

    // negative index -1 -> last element
    expect(v.at(-1)).toEqual({ x: 12, y: 22, z: 32 });
    // negative index -3 -> first element
    expect(v.at(-3)).toEqual({ x: 10, y: 20, z: 30 });
    // out-of-range positive
    expect(v.at(5)).toBeUndefined();
    // out-of-range negative beyond length
    expect(v.at(-10)).toBeUndefined();
  });

  test('from accepts Float32Array and discards trailing components', () => {
    const raw = new Float32Array([1, 2, 3, 4, 5, 6, 7]); // 7 elements -> 2 full vectors
    const v = Vector3Array.from(raw);
    expect(v.length).toBe(2);
    expect(v.get(0)).toEqual({ x: 1, y: 2, z: 3 });
    expect(v.get(1)).toEqual({ x: 4, y: 5, z: 6 });
  });

  test('from throws for non-Float32Array inputs', () => {
    // @ts-expect-error - intentionally passing wrong type to test runtime guard
    expect(() => Vector3Array.from([1, 2, 3, 4, 5, 6])).toThrow(
      'Cannot convert object to Vector3Array'
    );
  });

  test('getInto and getIntoArray copy values into provided containers', () => {
    const v = new Vector3Array(2);
    v.set(0, { x: 2, y: 3, z: 4 });
    v.set(1, { x: 5, y: 6, z: 7 });

    const obj = { x: 0, y: 0, z: 0 };
    v.getInto(obj, 1);
    expect(obj).toEqual({ x: 5, y: 6, z: 7 });

    const arr = [0, 0, 0];
    v.getIntoArray(arr, 0);
    expect(arr).toEqual([2, 3, 4]);
  });

  test('getX, getY, getZ return columns as Float32Array', () => {
    const v = new Vector3Array(3);
    v.set(0, { x: 1, y: 10, z: 100 });
    v.set(1, { x: 2, y: 20, z: 200 });
    v.set(2, { x: 3, y: 30, z: 300 });

    expect(Array.from(v.getX())).toEqual([1, 2, 3]);
    expect(Array.from(v.getY())).toEqual([10, 20, 30]);
    expect(Array.from(v.getZ())).toEqual([100, 200, 300]);
  });

  test('copyInto copies with start and step correctly', () => {
    const src = new Vector3Array(2);
    src.set(0, { x: 1, y: 1, z: 1 });
    src.set(1, { x: 2, y: 2, z: 2 });

    const dest = new Vector3Array(5); // dest initially zeros
    // copy into dest starting at index 1, step 2 -> fills indices 1 and 3
    src.copyInto(dest, { start: 1, step: 2 });

    expect(dest.get(0)).toEqual({ x: 0, y: 0, z: 0 });
    expect(dest.get(1)).toEqual({ x: 1, y: 1, z: 1 });
    expect(dest.get(2)).toEqual({ x: 0, y: 0, z: 0 });
    expect(dest.get(3)).toEqual({ x: 2, y: 2, z: 2 });
    // index 4 remains untouched
    expect(dest.get(4)).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('fillWithScalar sets all components and returns this', () => {
    const v = new Vector3Array(3);
    const returned = v.fillWithScalar(7);
    expect(returned).toBe(v);
    for (let i = 0; i < 3; i++) {
      expect(v.get(i)).toEqual({ x: 7, y: 7, z: 7 });
    }
  });

  test('addScalar is no-op for 0 and adds to every component otherwise', () => {
    const v = new Vector3Array(2);
    v.set(0, { x: 1, y: 2, z: 3 });
    v.set(1, { x: 4, y: 5, z: 6 });

    v.addScalar(0);
    expect(v.get(0)).toEqual({ x: 1, y: 2, z: 3 });

    v.addScalar(2);
    expect(v.get(0)).toEqual({ x: 3, y: 4, z: 5 });
    expect(v.get(1)).toEqual({ x: 6, y: 7, z: 8 });
  });

  test('multiplyWithScalar handles 1 (no-op), other scalars and 0 (fills zeros)', () => {
    const v = new Vector3Array(2);
    v.set(0, { x: 2, y: 3, z: 4 });
    v.set(1, { x: -1, y: -2, z: -3 });

    v.multiplyWithScalar(1);
    expect(v.get(0)).toEqual({ x: 2, y: 3, z: 4 });
    expect(v.get(1)).toEqual({ x: -1, y: -2, z: -3 });

    v.multiplyWithScalar(2);
    expect(v.get(0)).toEqual({ x: 4, y: 6, z: 8 });
    expect(v.get(1)).toEqual({ x: -2, y: -4, z: -6 });

    v.multiplyWithScalar(0);
    expect(v.get(0)).toEqual({ x: 0, y: 0, z: 0 });
    expect(v.get(1)).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('derivative computes centered finite differences and copies endpoints', () => {
    // create a linear ramp in x, y and z to make derivatives constant
    const n = 6;
    const v = new Vector3Array(n);
    for (let i = 0; i < n; i++) {
      v.set(i, { x: i * 1.5, y: i * -2, z: i * 0.5 });
    }

    // default numSteps=1, dt=1 -> derivative should be (f(i+1)-f(i-1))/2
    const d = v.derivative();
    // interior points 1..n-2 should show constant derivatives
    for (let i = 1; i < n - 1; i++) {
      expect(d.get(i).x).toBeCloseTo(1.5);
      expect(d.get(i).y).toBeCloseTo(-2);
      expect(d.get(i).z).toBeCloseTo(0.5);
    }
    // endpoints copied from nearest interior
    expect(d.get(0)).toEqual(d.get(1));
    expect(d.get(n - 1)).toEqual(d.get(n - 2));
  });

  test('derivative respects numSteps and dt and returns zeros for too-small arrays', () => {
    const v = new Vector3Array(4);
    for (let i = 0; i < 4; i++) {
      v.set(i, { x: i * 2, y: 0, z: 0 });
    }

    const d = v.derivative({ numSteps: 1, dt: 0.5 });
    expect(d.get(1).x).toBeCloseTo(4);
    expect(d.get(2).x).toBeCloseTo(4);

    // invalid numSteps should throw
    expect(() => v.derivative({ numSteps: 0 })).toThrow(
      'numSteps must be positive'
    );

    // small arrays: length < 2*numSteps+1 -> derivative filled with zeros
    const small = new Vector3Array(2);
    small.set(0, { x: 1, y: 1, z: 1 });
    small.set(1, { x: 2, y: 2, z: 2 });
    const ds = small.derivative({ numSteps: 1 });
    expect(ds.get(0)).toEqual({ x: 0, y: 0, z: 0 });
    expect(ds.get(1)).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('slice returns a new Vector3Array with correct contents', () => {
    const v = new Vector3Array(5);
    for (let i = 0; i < 5; i++) {
      v.set(i, { x: i + 1, y: i + 10, z: i + 100 });
    }

    const s = v.slice(1, 4); // should include indices 1,2,3
    expect(s.length).toBe(3);
    expect(s.get(0)).toEqual({ x: 2, y: 11, z: 101 });
    expect(s.get(2)).toEqual({ x: 4, y: 13, z: 103 });
  });

  test('toArray converts to regular JS array of objects', () => {
    const v = new Vector3Array(3);
    v.set(0, { x: 1, y: 2, z: 3 });
    v.set(1, { x: 4, y: 5, z: 6 });
    v.set(2, { x: 7, y: 8, z: 9 });

    const arr = v.toArray();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(3);
    expect(arr[1]).toEqual({ x: 4, y: 5, z: 6 });
  });

  test('release returns underlying Float32Array and invalidates the instance', () => {
    const v = new Vector3Array(2);
    v.set(0, { x: 1, y: 1, z: 1 });
    v.set(1, { x: 2, y: 2, z: 2 });

    const raw = v.release();
    expect(raw).toBeInstanceOf(Float32Array);
    // after release, the instance should have length 0
    expect(v.length).toBe(0);
    // the returned raw data should contain the original values
    expect(Array.from(raw.slice(0, 6))).toEqual([1, 1, 1, 2, 2, 2]);
  });
});
