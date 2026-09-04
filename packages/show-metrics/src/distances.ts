import type { TrajectoryPlayer } from '@skybrush/show-format';

import {
  getMinimumAndMaximumSampleVectors,
  type MinimumAndMaximumSampleVectors,
} from './aggregation.js';
import { samplePositionAt } from './position.js';
import { calculateAndAggregateSamples, type SampleVector } from './sampling.js';

/**
 * Pair of distance time series, ordered from minimum to maximum.
 */
export type DistanceEnvelope = MinimumAndMaximumSampleVectors;

const sampleDistancesFromHomeAt = (
  player: TrajectoryPlayer,
  timestamps: number[]
): SampleVector<number> => {
  const home = { x: 0, y: 0, z: 0 };
  player.getPositionAt(Number.NEGATIVE_INFINITY, home);

  const positions = samplePositionAt(player, timestamps);
  const position = { x: 0, y: 0, z: 0 };
  const distances = new Float32Array(timestamps.length);

  for (let index = 0; index < timestamps.length; index++) {
    positions.getInto(position, index);
    distances[index] = Math.hypot(
      position.x - home.x,
      position.y - home.y,
      position.z - home.z
    );
  }

  return distances;
};

/**
 * Returns the minimum and maximum Euclidean distances of a swarm from the
 * first point of each drone's trajectory at the given time instants.
 *
 * The returned arrays have the same order as `timestamps`; when no players or
 * no time instants are provided, both arrays are empty.
 *
 * @param players Trajectory players for the drones in the swarm.
 * @param timestamps Time instants, in seconds, at which to evaluate the players.
 */
export function getMinimumAndMaximumDistancesFromHomeAt(
  players: Iterable<TrajectoryPlayer>,
  timestamps: number[]
): DistanceEnvelope {
  return calculateAndAggregateSamples(
    players,
    timestamps,
    sampleDistancesFromHomeAt,
    getMinimumAndMaximumSampleVectors
  );
}
