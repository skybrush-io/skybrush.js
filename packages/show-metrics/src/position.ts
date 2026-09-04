import { type TrajectoryPlayer, Vector3Array } from '@skybrush/show-format';

/**
 * Samples the positions of a trajectory at the given time instants.
 *
 * @param player the trajectory player to use for sampling the trajectory
 * @param times  the time instants (in seconds) at which to sample the trajectory
 * @returns An array of 3D positions corresponding to the given time instants.
 */
export function samplePositionAt(
  player: TrajectoryPlayer,
  times: number[]
): Vector3Array {
  const result = new Float32Array(times.length * 3);
  player.getPositionsAt(times, result);
  return Vector3Array.from(result);
}
