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
export const isAllowedInRedux = (value) =>
  isPlain(value) || isFunction(value) || isPromise(value) || isError(value);

export const noPayload = (func) => ({
  prepare: () => ({}),
  reducer: func,
});

export const stripEvent = (func) => (event, ...args) => func(...args);
