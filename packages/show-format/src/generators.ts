/**
 * Generator that yields `[previous, current]` pairs from the given iterable.
 *
 * Note: the first item will only be present in the first pair as `previous`,
 * and the last item will only be present in the last pair as `current`.
 */
export function* iterPairs<T>(items: Iterable<T>): Generator<[T, T]> {
  let last: T | undefined = undefined;

  for (const current of items) {
    if (last !== undefined) {
      yield [last, current];
    }
    last = current;
  }
}

/**
 * Generator that yields items from the given iterable, starting from the first
 * item that matches the `start` predicate, and stopping at the first item that
 * matches the `stop` predicate.
 *
 * Notes:
 *
 * - The `stop()` predicate is only evaluated after the `start()` predicate
 * has been matched.
 * - The `stop()` predicate is evaluated on the first item that matches the
 * `start()` predicate.
 * - The item matching the`stop()` predicate is not yielded.
 *
 * @param items The iterable to slice.
 * @param start The predicate to start slicing from.
 * @param stop The predicate to stop slicing at.
 */
export function* slice<T>(
  items: Iterable<T>,
  start: (val: T) => boolean,
  stop: (val: T) => boolean
) {
  let started = false;
  for (const item of items) {
    started = started || start(item);
    if (started) {
      if (stop(item)) {
        break;
      }

      yield item;
    }
  }
}
