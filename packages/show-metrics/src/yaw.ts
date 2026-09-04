import { type YawControlPlayer } from '@skybrush/show-format';

/**
 * Samples the yaw of a yaw control player at the given time instants.
 *
 * @param player the yaw control player to use for sampling the yaw angles
 * @param times  the time instants (in seconds) at which to sample
 * @returns An array of yaw angles (in radians) corresponding to the given time instants.
 */
export function sampleYawAt(
  player: YawControlPlayer,
  times: number[]
): number[] {
  const result = new Float32Array(times.length);
  player.getPoseCoordinatesAt(times, 'z', result); // [rad]
  return Array.from(result);
}
