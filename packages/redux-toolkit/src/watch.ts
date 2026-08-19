/* Originally from https://github.com/ExodusOSS/redux-watch
 *
 * Converted to TypeScript by Tamas Nepusz.
 *
 * Original license of redux-watch: MIT License, Copyright © 2022 Exodus Movement, Inc.
 */

function defaultCompare(a: any, b: any): boolean {
  return a === b;
}

export type ListenerFn<T = unknown> = (newValue: T, oldValue: T) => void;

export function watch<T>(
  getState: () => T,
  compare: (a: T, b: T) => boolean = defaultCompare
) {
  let currentValue = getState();
  return function w(fn: ListenerFn<T>) {
    return function () {
      let newValue = getState();
      if (!compare(currentValue, newValue)) {
        const oldValue = currentValue;
        currentValue = newValue;
        fn(newValue, oldValue);
      }
    };
  };
}

export default watch;
