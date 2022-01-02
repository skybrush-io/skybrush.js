import { isPlain } from '@reduxjs/toolkit';

import isPromise from 'is-promise';
import isError from 'lodash-es/isError';
import isFunction from 'lodash-es/isFunction';

/**
 * Function that specifies the types of values we are willing to allow in Redux
 * actions and in the store.
 *
 * Since redux-persist uses functions in actions and redux-promise-middleware
 * uses errors, we need to allow these to silence warnings from @reduxjs/toolkit.
 */
export const isAllowedInRedux = (value: any): boolean =>
  isPlain(value) || isFunction(value) || isPromise(value) || isError(value);

export function noPayload<S>(func: (state: S) => void) {
  return {
    prepare: () => ({}),
    reducer: func,
  };
}

export function stripEvent<F extends (...args: any[]) => any>(
  func: F
): (event: Event, ...args: Parameters<F>) => ReturnType<F> {
  /* eslint-disable @typescript-eslint/no-unsafe-return */
  return (_event: Event, ...args: Parameters<F>) => func(...args);
  /* eslint-enable @typescript-eslint/no-unsafe-return */
}
