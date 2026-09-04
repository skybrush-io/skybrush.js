import type { SampleVector } from './sampling.js';

/**
 * Type specification for functions that aggregate multiple sample vectors into a single
 * consistent result object.
 */
export type SampleAggregator<TValue, TResult> = (
  samples: readonly SampleVector<TValue>[],
  timestamps: readonly number[]
) => TResult;

/**
 * Pair of numeric sample vectors, ordered from minimum to maximum.
 */
export type MinimumAndMaximumSampleVectors = [
  minimum: number[],
  maximum: number[],
];

/**
 * Returns the minimum and maximum values from each position in a set of
 * equally-sized numeric sample vectors.
 *
 * Returns two empty vectors when no sample vectors are provided. Callers using
 * this as a SampleAggregator should use `calculateAndAggregateSwarmSamples()`,
 * which verifies that the sample vectors match the timestamp count.
 *
 * @param samplesByDrone Numeric sample vectors.
 * @param timestamps Time instants corresponding to the sample vector positions.
 */
export function getMinimumAndMaximumSampleVectors(
  samplesByDrone: readonly SampleVector<number>[],
  timestamps: readonly number[]
): MinimumAndMaximumSampleVectors {
  if (samplesByDrone.length === 0) {
    return [[], []];
  }

  const minimum: number[] = [];
  const maximum: number[] = [];

  for (let index = 0; index < timestamps.length; index++) {
    let minimumValue = Number.POSITIVE_INFINITY;
    let maximumValue = Number.NEGATIVE_INFINITY;

    for (const samples of samplesByDrone) {
      const value = samples[index]!;
      minimumValue = Math.min(minimumValue, value);
      maximumValue = Math.max(maximumValue, value);
    }

    minimum.push(minimumValue);
    maximum.push(maximumValue);
  }

  return [minimum, maximum];
}
