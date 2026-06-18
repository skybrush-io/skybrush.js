import { toDegrees, toRadians } from './angles.js';
import type { Degrees, PolarDegreesTuple, Vector2Tuple } from './types.js';

/**
 * Converts a center, an angle and a radius in polar coordinates into Cartesian
 * coordinates.
 *
 * The angle is assumed to be increasing counter-clockwise; zero points to the
 * East (positive X axis).
 *
 * @param center - The center coordinate at radius zero
 * @param angle - The angle, in degrees
 * @param radius - The radius
 * @returns The Cartesian coordinates equivalent to the input polar coordinates
 */
export function polarCCW({
  center = [0, 0],
  angle,
  radius = 1,
}: {
  center?: Vector2Tuple;
  angle: number;
  radius?: number;
}): Vector2Tuple {
  const rad = toRadians(angle);
  return [
    center[0] + radius * Math.cos(rad),
    center[1] + radius * Math.sin(rad),
  ];
}

/**
 * Converts a center, an angle and a radius in polar coordinates into Cartesian
 * coordinates.
 *
 * The angle is assumed to be increasing counter-clockwise; zero points to the North
 * (positive Y axis).
 *
 * @param center - The center coordinate at radius zero
 * @param angle - The angle, in degrees
 * @param radius - The radius
 * @returns The Cartesian coordinates equivalent to the input polar coordinates
 */
export function polarCCWNorth({
  center = [0, 0],
  angle,
  radius = 1,
}: {
  center?: Vector2Tuple;
  angle: number;
  radius?: number;
}): Vector2Tuple {
  const rad = toRadians(90 + angle);
  return [
    center[0] + radius * Math.cos(rad),
    center[1] + radius * Math.sin(rad),
  ];
}

/**
 * Converts a center, an angle and a radius in polar coordinates into Cartesian
 * coordinates.
 *
 * The angle is assumed to be increasing clockwise; zero points to the East (positive
 * X axis).
 *
 * @param center - The center coordinate at radius zero
 * @param angle - The angle, in degrees
 * @param radius - The radius
 * @returns The Cartesian coordinates equivalent to the input polar coordinates
 */
export function polarCW({
  center = [0, 0],
  angle,
  radius = 1,
}: {
  center?: Vector2Tuple;
  angle: Degrees;
  radius?: number;
}): Vector2Tuple {
  const rad = toRadians(0 - angle);
  return [
    center[0] + radius * Math.cos(rad),
    center[1] + radius * Math.sin(rad),
  ];
}

/**
 * Converts a center, an angle and a radius in polar coordinates into Cartesian
 * coordinates.
 *
 * The angle is assumed to be increasing clockwise; zero points to the North (positive
 * Y axis).
 *
 * @param center - The center coordinate at radius zero
 * @param angle - The angle, in degrees
 * @param radius - The radius
 * @returns The Cartesian coordinates equivalent to the input polar coordinates
 */
export function polarCWNorth({
  center = [0, 0],
  angle,
  radius = 1,
}: {
  center?: Vector2Tuple;
  angle: Degrees;
  radius?: number;
}): Vector2Tuple {
  const rad = toRadians(90 - angle);
  return [
    center[0] + radius * Math.cos(rad),
    center[1] + radius * Math.sin(rad),
  ];
}

export const polar = polarCCW;

/**
 * Converts a two dimensional vector to polar coordinates.
 *
 * The angle is assumed to be increasing counter-clockwise; zero points to the
 * East (positive X axis). It will be returned in degrees, in the range [0; 360).
 */
export const toPolar = (coords: Vector2Tuple): PolarDegreesTuple => {
  const dist = Math.hypot(coords[0], coords[1]);
  if (dist > 0) {
    const angle = toDegrees(Math.atan2(coords[1], coords[0]));
    return [dist, angle < 0 ? angle + 360 : angle] as PolarDegreesTuple;
  }

  return [0, 0] as PolarDegreesTuple;
};
