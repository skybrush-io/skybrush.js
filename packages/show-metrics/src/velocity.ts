import { type TrajectoryPlayer, Vector3Array } from '@skybrush/show-format';

/**
 * Samples the velocities of a trajectory at the given time instants.
 *
 * @param player the trajectory player to use for sampling the trajectory
 * @param times  the time instants (in seconds) at which to sample the trajectory
 * @returns An array of 3D velocity vectors corresponding to the given time instants.
 */
export function sampleVelocityAt(
  player: TrajectoryPlayer,
  times: number[]
): Vector3Array {
  const result = new Float32Array(times.length * 3);
  player.getVelocitiesAt(times, result);
  return Vector3Array.from(result);
}
