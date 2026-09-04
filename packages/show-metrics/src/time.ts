/**
 * Samples a time interval evenly at a fixed rate.
 *
 * @param duration - the duration of the time interval
 * @param sampleRate - the sampling rate (samples per second)
 * @returns An array of time instants (in seconds) sampled evenly over the duration.
 *      It is ensured that the last sample is exactly at the end of the duration.
 */
export function sampleDurationEvenly(
  duration: number,
  sampleRate: number
): number[] {
  const length = Math.ceil(duration * sampleRate);
  const result = Array.from({ length }).map((_, index) => index / sampleRate);

  if (result.length > 0 && result.at(-1)! < duration) {
    result.push(duration);
  }

  return result;
}
