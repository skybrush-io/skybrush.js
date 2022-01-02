/**
 * @file The master store for the application state.
 */

import {
  Action,
  ActionCreator,
  EnhancedStore,
  Middleware,
  Reducer,
  configureStore as configureReduxStore,
} from '@reduxjs/toolkit';
import type { EnhancerOptions as DevToolsOptions } from '@reduxjs/toolkit/dist/devtoolsExtension';

import produce from 'immer';
import get from 'lodash-es/get';
import identity from 'lodash-es/identity';
import noop from 'lodash-es/noop';
import createDeferred from 'p-defer';
import { persistStore, persistReducer, Persistor } from 'redux-persist';
import createSagaMiddleware, {
  Saga,
  SagaMiddlewareOptions,
  Task,
} from 'redux-saga';

import { createActionScrubber, resolveActionTypes } from './actions';
import { createStorageConfiguration, StorageConfig } from './persistence';
import { isAllowedInRedux } from './utils';

type Middlewares<S> = ReadonlyArray<Middleware<unknown, S>>;

export interface ExtendedDevToolsOptions extends DevToolsOptions {
  scrubbedActions?: Array<string | ActionCreator<string>>;
  scrubbedPaths?: string[];
}

export interface StoreAndPersistenceConfig<
  S = any,
  A extends Action<string> = Action<string>,
  M extends Middlewares<S> = Middlewares<S>
> {
  devTools?: boolean | ExtendedDevToolsOptions;
  ignoredActions?: Array<string | ActionCreator<string>>;
  ignoredPaths?: string[];
  middleware?: M;
  reducer: Reducer<S, A>;
  sagaOptions?: SagaMiddlewareOptions;
  storage?: StorageConfig<S>;
}

export interface PersistableStore<
  S = any,
  A extends Action = Action<string>,
  M extends Middlewares<S> = Middlewares<S>
> extends EnhancedStore<S, A, M> {
  clear: () => Promise<void>;
  runSaga: <S extends Saga>(saga: S, ...args: Parameters<S>) => Task;
  waitUntilStateRestored: () => Promise<void>;
}

type ActionSanitizer = DevToolsOptions['actionSanitizer'];
type StateSanitizer = DevToolsOptions['stateSanitizer'];

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
 * @param {Object}  sagaOptions  options of the saga middleware that will be
 *        passed intact to the middleware
 * @param {string[]} scrubbedActions  list of Redux actions whose payload will be
 *        replaced with a placeholder in the Redux dev tools
 * @param {string[]} scrubbedPaths list of Redux state paths whose content will be
 *        replaced with a placeholder in the Redux dev tools
 * @return {Object}  an object with two keys: 'store'
 */
export function configureStoreAndPersistence<
  S,
  A extends Action<string>,
  M extends Middlewares<S>
>({
  devTools = {},
  ignoredActions = [],
  ignoredPaths = [],
  middleware,
  reducer,
  sagaOptions = {},
  storage,
}: StoreAndPersistenceConfig<S, A, M>) {
  let persistor: Persistor;
  let finalDevToolsOptions: boolean | DevToolsOptions;

  const resolvedIgnoredActions = resolveActionTypes(ignoredActions);

  if (!devTools) {
    finalDevToolsOptions = false;
  } else {
    const emptyDevToolsOptions: ExtendedDevToolsOptions = {};
    const {
      actionSanitizer,
      scrubbedActions = [],
      scrubbedPaths = [],
      stateSanitizer,
      ...restOfDevTools
    } = devTools === true ? emptyDevToolsOptions : devTools;
    let finalActionSanitizer: ActionSanitizer;
    let finalStateSanitizer: StateSanitizer;

    if (scrubbedActions) {
      const actionScrubber = createActionScrubber(scrubbedActions);
      finalActionSanitizer = (actionSanitizer
        ? (action: A, ...rest: [number]) =>
            actionSanitizer(actionScrubber(action), ...rest)
        : actionScrubber) as any as ActionSanitizer;
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

      const stateScrubber = produce((state: S) => {
        for (const [path, key] of filteredScrubbedPaths) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const value = get(state, path);
          if (value !== undefined) {
            if (key) {
              value[key] = '<<JSON_DATA>>';
            } else {
              state[String(value)] = '<<JSON_DATA>>';
            }
          }
        }
      });

      finalStateSanitizer = (stateSanitizer
        ? (state: S, ...rest: [number]) =>
            stateSanitizer(stateScrubber(state as any), ...rest)
        : stateScrubber) as any as StateSanitizer;
    }

    finalDevToolsOptions = {
      actionSanitizer: finalActionSanitizer,
      stateSanitizer: finalStateSanitizer,
      ...restOfDevTools,
    };
  }

  const sagaMiddleware = createSagaMiddleware(sagaOptions);

  if (storage) {
    reducer = persistReducer(createStorageConfiguration(storage), reducer);
  }

  const store: PersistableStore<S, A, M> = configureReduxStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Ignore paths in the state store that are likely to store
        // large amounts of data in immutability checks
        immutableCheck: {
          ignoredPaths,
        },
        serializableCheck: {
          isSerializable: isAllowedInRedux,
          ignoredActions: resolvedIgnoredActions,
          ignoredPaths,
        },
      }).concat(sagaMiddleware, ...middleware),
    devTools: finalDevToolsOptions,
  }) as PersistableStore<S, A, M>;

  const stateLoaded = createDeferred<void>();

  if (storage) {
    persistor = persistStore(store as any, null, stateLoaded.resolve);
  } else {
    persistor = {
      flush: async () => Promise.all([]),
      pause: noop,
      persist: noop,
      purge: async () => Promise.all([]),
      getState: () => ({ bootstrapped: true, registry: [] }),
      subscribe: () => noop,
      dispatch: identity,
    };
    stateLoaded.resolve();
  }

  store.waitUntilStateRestored = async () => stateLoaded.promise;
  store.clear = persistor.purge;
  store.runSaga = sagaMiddleware.run;

  return { store, persistor };
}
