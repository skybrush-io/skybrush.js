export type Vector2 = { x: number; y: number };
export type Vector2Tuple = [number, number];
export type Vector3 = { x: number; y: number; z: number };
export type Vector3Tuple = [number, number, number];

/**
 * Utility type for 2D coordinates with an arbitrary number of additional
 * dimensions. It is useful when a function ignores additional dimenstions
 * and we want to allow for example 3D coordinates as input without data
 * conversion or type errors.
 */
export type Vector2PlusTuple = [number, number, ...number[]];

const _Radius: unique symbol = Symbol('Radius');
export type Radius = number & { [_Radius]: void };

const _Degrees: unique symbol = Symbol('Degrees');
export type Degrees = number & { [_Degrees]: void };

const _Radians: unique symbol = Symbol('Radians');
export type Radians = number & { [_Radians]: void };

export type PolarDegrees = { angle: Degrees; radius: Radius };
export type PolarDegreesTuple = [Radius, Degrees];
export type PolarRadians = { angle: Radians; radius: Radius };
export type PolarRadiansTuple = [Radius, Radians];

export type Quaternion = { x: number; y: number; z: number; w: number };

/**
 * Quaternion, in tuple notation, in JPL order (wxyz).
 */
export type QuaternionWXYZTuple = [number, number, number, number];

/**
 * Type guard for checking whether the input is a valid 2D vector.
 */
export const isVector2Tuple = (
  coordinate: unknown
): coordinate is Vector2Tuple =>
  Array.isArray(coordinate) &&
  coordinate.length === 2 &&
  coordinate.every((c) => typeof c === 'number');

/**
 * Type guard for checking whether the input is a valid 2D, 3D or higher-dimensional
 * vector.
 */
export const isVector2PlusTuple = (
  coordinate: unknown
): coordinate is Vector2PlusTuple =>
  Array.isArray(coordinate) &&
  coordinate.length >= 2 &&
  coordinate.every((c) => typeof c === 'number');

/**
 * Type guard for checking whether the input is a valid 3D vector.
 */
export const isVector3Tuple = (
  coordinate: unknown
): coordinate is Vector3Tuple =>
  Array.isArray(coordinate) &&
  coordinate.length === 3 &&
  coordinate.every((c) => typeof c === 'number');

/**
 * Type guard for checking whether the input is a valid quaternion.
 */
export const isQuaternionWXYZTuple = (
  coordinate: unknown
): coordinate is QuaternionWXYZTuple =>
  Array.isArray(coordinate) &&
  coordinate.length === 4 &&
  coordinate.every((c) => typeof c === 'number');
