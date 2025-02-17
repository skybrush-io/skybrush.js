import test from 'ava';

import { iterPairs, slice } from '../src/generators';

test('test iterPairs', (t) => {
  const items = [11, 22, 33, 44, 55, 66, 77, 88, 99];
  const pairs = Array.from(iterPairs(items));
  t.deepEqual(pairs, [
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

test('test slice', (t) => {
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
  t.deepEqual(result, [33, 44, 55, 66]);
  t.deepEqual(startEvaluated, [11, 22, 33]);
  t.deepEqual(stopEvaluated, [33, 44, 55, 66, 77]);
});

test('test slice empty', (t) => {
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
  t.deepEqual(result, []);
  t.deepEqual(startEvaluated, [11, 22, 33]);
  t.deepEqual(stopEvaluated, [33]);
});
