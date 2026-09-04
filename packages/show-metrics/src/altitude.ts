import type { TrajectoryPlayer } from '@skybrush/show-format';

import {
  getMinimumAndMaximumSampleVectors,
  type MinimumAndMaximumSampleVectors,
} from './aggregation.js';
import { calculateAndAggregateSamples, type SampleVector } from './sampling.js';

/**
 * Pair of altitude time series, ordered from minimum to maximum.
 */
export type AltitudeEnvelope = MinimumAndMaximumSampleVectors;

const sampleAltitudesAt = (
  player: TrajectoryPlayer,
  timestamps: number[]
): SampleVector<number> => {
  const positions = new Float32Array(timestamps.length * 3);
  player.getPositionsAt(timestamps, positions);

  const altitudes = new Float32Array(timestamps.length);
  for (let index = 0; index < timestamps.length; index++) {
    altitudes[index] = positions[index * 3 + 2]!;
  }

  return altitudes;
};

/**
 * Returns the minimum and maximum altitude of a swarm at the given time
 * instants.
 *
 * Each player is evaluated at every time instant. The returned arrays have the
 * same order as `timestamps`; when no players or no time instants are
 * provided, both arrays are empty.
 *
 * @param players Trajectory players for the drones in the swarm.
 * @param timestamps Time instants, in seconds, at which to evaluate the players.
 */
export function getMinimumAndMaximumAltitudesAt(
  players: Iterable<TrajectoryPlayer>,
  timestamps: number[]
): AltitudeEnvelope {
  return calculateAndAggregateSamples(
    players,
    timestamps,
    sampleAltitudesAt,
    getMinimumAndMaximumSampleVectors
  );
}
