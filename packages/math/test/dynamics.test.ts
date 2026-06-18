import { estimatePathDuration } from '../dist/dynamics.js';

describe('estimatePathDuration', () => {
  test('returns zero for zero distance', () => {
    expect(
      estimatePathDuration({
        distance: 0,
        targetVelocity: 10,
        acceleration: 2.5,
      })
    ).toBe(0);
  });

  test('does not include a constant-speed segment when the target velocity is high', () => {
    expect(
      estimatePathDuration({
        distance: 2.5,
        targetVelocity: 10,
        acceleration: 2.5,
      })
    ).toBe(2);
  });

  test('includes a constant-speed segment when the target velocity is reached', () => {
    expect(
      estimatePathDuration({ distance: 20, targetVelocity: 4, acceleration: 2 })
    ).toBe(7);
  });

  test('handles the threshold where acceleration and deceleration exactly fill the path', () => {
    expect(
      estimatePathDuration({ distance: 8, targetVelocity: 4, acceleration: 2 })
    ).toBe(4);
  });
});
