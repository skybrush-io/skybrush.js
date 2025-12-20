import { iterPairs, slice } from '../dist/generators.js';

test('test iterPairs', () => {
  const items = [11, 22, 33, 44, 55, 66, 77, 88, 99];
  const pairs = Array.from(iterPairs(items));
  expect(pairs).toEqual([
    [11, 22],
    [22, 33],
    [33, 44],
    [44, 55],
    [55, 66],
    [66, 77],
    [77, 88],
    [88, 99],
  ]);
});

test('test slice', () => {
  const items = [11, 22, 33, 44, 55, 66, 77, 88, 99];
  const startEvaluated: number[] = [];
  const start = (v: number) => {
    startEvaluated.push(v);
    return v > 30;
  };
  const stopEvaluated: number[] = [];
  const stop = (v: number) => {
    stopEvaluated.push(v);
    return v > 70;
  };

  const result = Array.from(slice(items, start, stop));
  expect(result).toEqual([33, 44, 55, 66]);
  expect(startEvaluated).toEqual([11, 22, 33]);
  expect(stopEvaluated).toEqual([33, 44, 55, 66, 77]);
});

test('test slice empty', () => {
  const items = [11, 22, 33, 44, 55, 66, 77, 88, 99];
  const startEvaluated: number[] = [];
  const start = (v: number) => {
    startEvaluated.push(v);
    return v > 30;
  };
  const stopEvaluated: number[] = [];
  const stop = (v: number) => {
    stopEvaluated.push(v);
    return v > 30;
  };

  const result = Array.from(slice(items, start, stop));
  expect(result).toEqual([]);
  expect(startEvaluated).toEqual([11, 22, 33]);
  expect(stopEvaluated).toEqual([33]);
});
