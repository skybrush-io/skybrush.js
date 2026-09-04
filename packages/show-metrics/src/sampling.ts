import type { SampleAggregator } from './aggregation.js';

/**
 * A sequence of samples calculated at consecutive time instants.
 */
export type SampleVector<TValue> = ArrayLike<TValue>;

/**
 * Calculates one sample vector for a trajectory or yaw player at the given time
 * instants.
 */
export type SampleCalculator<TInput, TValue> = (
  player: TInput,
  timestamps: number[]
) => SampleVector<TValue>;

/**
 * Calculates one time series for each input object, then aggregates the per-input
 * series into one result.
 *
 * Every vector returned by `calculate` must have one item for each timestamp.
 * A RangeError is thrown otherwise. When `players` is empty, `aggregate` is
 * invoked with an empty list of sample vectors.
 *
 * @param inputs Input objects; typically players for the drones in the swarm.
 * @param timestamps Time instants, in seconds, at which to evaluate the items.
 * @param calculate Function that calculates one sample vector for an item.
 * @param aggregate Function that aggregates all calculated sample vectors.
 */
export function calculateAndAggregateSamples<TInput, TValue, TResult>(
  inputs: Iterable<TInput>,
  timestamps: number[],
  calculate: SampleCalculator<TInput, TValue>,
  aggregate: SampleAggregator<TValue, TResult>
): TResult {
  const samplesByItems = Array.from(inputs, (input) =>
    calculate(input, timestamps)
  );

  for (const samples of samplesByItems) {
    if (samples.length !== timestamps.length) {
      throw new RangeError(
        'Calculated sample vector length does not match timestamp count'
      );
    }
  }

  return aggregate(samplesByItems, timestamps);
}
