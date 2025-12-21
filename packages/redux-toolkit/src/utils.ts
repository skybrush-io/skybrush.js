import type { CaseReducer, Draft, PayloadAction } from '@reduxjs/toolkit';
import { isPlain } from '@reduxjs/toolkit';
import { isError, isFunction, isPromise } from '@sindresorhus/is';

/**
 * Function that specifies the types of values we are willing to allow in Redux
 * actions and in the store.
 *
 * Since redux-persist uses functions in actions and redux-promise-middleware
 * uses errors, we need to allow these to silence warnings from @reduxjs/toolkit.
 */
export const isAllowedInRedux = (value: any): boolean =>
  isPlain(value) || isFunction(value) || isPromise(value) || isError(value);

export function noPayload<S>(
  func: (state: Draft<S>) => void
): CaseReducer<S, PayloadAction> {
  /* we need to lie about the return type here because the type inference does
   * not work in dependent projects if we return the real return type
   * (i.e. CaseReducerWithPrepare<S, PayloadAction>) */
  return {
    prepare: () => ({ payload: undefined }),
    reducer: func,
  } as any as CaseReducer<S, PayloadAction>;
}

export function stripEvent<F extends (...args: any[]) => any>(
  func: F
): (event: Event, ...args: Parameters<F>) => ReturnType<F> {
  /* eslint-disable @typescript-eslint/no-unsafe-return */
  return (_event: Event, ...args: Parameters<F>) => func(...args);
  /* eslint-enable @typescript-eslint/no-unsafe-return */
}
