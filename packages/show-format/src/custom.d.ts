declare module 'bezier-js' {
  type Point = {
    x: number;
    y: number;
    z: number;
  };

  class Bezier {
    constructor(
      x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number,
      x3: number,
      y3: number,
      z3: number,
      x4?: number,
      y4?: number,
      z4?: number
    );

    compute(number: number): Point;
    derivative(number: number): Point;
  }
}
