/**
 * @file The master store for the application state.
 */

import {
  configureStore as configureReduxStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';

import produce from 'immer';
import get from 'lodash-es/get';
import noop from 'lodash-es/noop';
import createDeferred from 'p-defer';
import { persistStore, persistReducer } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';

import { createActionScrubber, resolveActionTypes } from './actions';
import { createStorageConfiguration } from './persistence';
import { isAllowedInRedux } from './utils';

/**
 * Configures a Redux store and the corresponding persistor object that takes
 * care of saving the state of the store regularly.
 *
 * @param {function} reducer  the main Redux reducer of the application
 * @param {Object}   storage  configuration of the storage layer; see
 *        `createStorageConfiguration()` for more details
 * @param {string[]} ignoredActions  list of Redux actions that will be ignored
 *        in immutability and serializability checks
 * @param {string[]} ignoredPaths    list of Redux state paths that will be ignored
 *        in immutability and serializability checks
 * @param {function[]}  middleware   list of Redux middleware to apply on the store
 * @param {function|function[]}  sagas  list of Redux saga to start when the
 *        state of the store is restored
 * @param {Object}  sagaOptions  options of the saga middleware that will be
 *        passed intact to the middleware
 * @param {string[]} scrubbedActions  list of Redux actions whose payload will be
 *        replaced with a placeholder in the Redux dev tools
 * @param {string[]} scrubbedPaths list of Redux state paths whose content will be
 *        replaced with a placeholder in the Redux dev tools
 * @return {Object}  an object with two keys: 'store'
 */
export const configureStoreAndPersistence = ({
  devTools = {},
  ignoredActions = [],
  ignoredPaths = [],
  middleware = [],
  reducer,
  sagas,
  sagaOptions = {},
  storage,
} = {}) => {
  const {
    actionSanitizer,
    scrubbedActions = [],
    scrubbedPaths = [],
    stateSanitizer,
    ...restOfDevTools
  } = devTools;

  let finalActionSanitizer;
  let finalStateSanitizer;
  let persistor;
  let sagaMiddleware;

  ignoredActions = resolveActionTypes(ignoredActions);

  if (scrubbedActions) {
    const actionScrubber = createActionScrubber(scrubbedActions);
    finalActionSanitizer = actionSanitizer
      ? (action, ...rest) => actionSanitizer(actionScrubber(action), ...rest)
      : actionScrubber;
  } else {
    finalActionSanitizer = actionSanitizer;
  }

  if (scrubbedPaths) {
    const filteredScrubbedPaths = scrubbedPaths.map((path) => {
      const index = path.lastIndexOf('.');
      if (index >= 0) {
        return [path.slice(0, index), path.slice(index + 1)];
      }

      return [path, ''];
    });

    const stateScrubber = produce((state) => {
      for (const [path, key] of filteredScrubbedPaths) {
        const value = get(state, path);
        if (value !== undefined) {
          if (key) {
            value[key] = '<<JSON_DATA>>';
          } else {
            state[value] = '<<JSON_DATA>>';
          }
        }
      }
    });

    finalStateSanitizer = stateSanitizer
      ? (action, ...rest) => stateSanitizer(stateScrubber(action), ...rest)
      : stateScrubber;
  }

  if (!Array.isArray(sagas)) {
    sagas = [sagas];
  }

  if (sagas.length > 0) {
    sagaMiddleware = createSagaMiddleware(sagaOptions);
    middleware = [sagaMiddleware, ...middleware];
  }

  if (storage) {
    reducer = persistReducer(createStorageConfiguration(storage), reducer);
  }

  const store = configureReduxStore({
    reducer,
    middleware: [
      ...getDefaultMiddleware({
        // Ignore paths in the state store that are likely to store
        // large amounts of data in immutability checks
        immutableCheck: {
          ignoredPaths,
        },

        serializableCheck: {
          isSerializable: isAllowedInRedux,
          ignoredActions,
          ignoredPaths,
        },
      }),
      ...middleware,
    ],

    devTools: {
      actionSanitizer: finalActionSanitizer,
      stateSanitizer: finalStateSanitizer,
      ...restOfDevTools,
    },
  });

  const stateLoaded = createDeferred();

  if (storage) {
    persistor = persistStore(store, null, stateLoaded.resolve);
  } else {
    persistor = {
      flush: () => Promise.all([]),
      pause: noop,
      persist: noop,
      purge: () => Promise.all([]),
      getState: () => ({ bootstrapped: true }),
      subscribe: noop,
      dispatch: noop,
    };
    stateLoaded.resolve();
  }

  store.waitUntilStateRestored = () => stateLoaded.promise;
  store.clear = persistor.purge;

  if (sagaMiddleware) {
    const rootSaga =
      sagas.length === 1
        ? sagas[0]
        : function* () {
            yield all(sagas);
          };

    store.runSaga = sagaMiddleware.run;
    store.waitUntilStateRestored().then(() => {
      store.runSaga(rootSaga);
    });
  }

  return { store, persistor };
};
