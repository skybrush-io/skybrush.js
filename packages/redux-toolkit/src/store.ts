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
  MiddlewareArray,
} from '@reduxjs/toolkit';
import type { DevToolsEnhancerOptions } from '@reduxjs/toolkit/dist/devtoolsExtension';

import produce from 'immer';
import get from 'lodash-es/get';
import identity from 'lodash-es/identity';
import noop from 'lodash-es/noop';
import createDeferred from 'p-defer';
import { persistStore, persistReducer, Persistor } from 'redux-persist';
import createSagaMiddleware, {
  Saga,
  SagaMiddleware,
  SagaMiddlewareOptions,
  Task,
} from 'redux-saga';
import { ThunkMiddleware } from 'redux-thunk';

import { createActionScrubber, resolveActionTypes } from './actions';
import { createStorageConfiguration, StorageConfig } from './persistence';
import { isAllowedInRedux } from './utils';

type Middlewares<S> = ReadonlyArray<Middleware<unknown, S>>;

export interface ExtendedDevToolsOptions extends DevToolsEnhancerOptions {
  actionsAllowlist?: string | string[];
  actionsDenylist?: string | string[];
  scrubbedActions?: Array<string | ActionCreator<string>>;
  scrubbedPaths?: string[];
}

export interface StoreAndPersistenceConfig<
  S = any,
  A extends Action<string> = Action<string>,
  M extends Middlewares<S> = Middlewares<S>,
  C extends Record<string, unknown> = Record<string, unknown>
> {
  devTools?: boolean | ExtendedDevToolsOptions;
  ignoredActions?: Array<string | ActionCreator<string>>;
  ignoredPaths?: string[];
  middleware?: M;
  reducer: Reducer<S, A>;
  sagaOptions?: SagaMiddlewareOptions<C>;
  storage?: StorageConfig<S>;
}

export type PersistableStore<
  S = any,
  A extends Action = Action<string>,
  M extends Middlewares<S> = Middlewares<S>
> = EnhancedStore<S, A, M> & {
  clear: () => Promise<void>;
  runSaga: <S extends Saga>(saga: S, ...args: Parameters<S>) => Task;
  waitUntilStateRestored: () => Promise<void>;
};

type ActionSanitizer = DevToolsEnhancerOptions['actionSanitizer'];
type StateSanitizer = DevToolsEnhancerOptions['stateSanitizer'];

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
 * @return {Object}  an object with two keys: 'store' and 'persistor'
 */
export function configureStoreAndPersistence<
  S,
  A extends Action<string>,
  M extends Middlewares<S>,
  C extends Record<string, unknown> = Record<string, unknown>
>({
  devTools = {},
  ignoredActions = [],
  ignoredPaths = [],
  middleware,
  reducer,
  sagaOptions = {},
  storage,
}: StoreAndPersistenceConfig<S, A, M, C>): {
  store: PersistableStore<
    S,
    A,
    MiddlewareArray<[ThunkMiddleware<S, A>, SagaMiddleware<C>, ...M]>
  >;
  persistor: Persistor;
} {
  let persistor: Persistor;
  let finalDevToolsOptions: boolean | DevToolsEnhancerOptions;

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
              // (state as any) cast needed to get rid of a Typescript error;
              // TS apparently thinks that the state object cannot be indexed
              // with a string
              (state as any)[value] = '<<JSON_DATA>>';
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
    // Round-trip casting needed because TypeScript knows that persistReducer()
    // will extend the state with a hidden branch and we are not interested
    // in that
    reducer = persistReducer(
      createStorageConfiguration(storage),
      reducer
    ) as any as Reducer<S, A>;
  }

  const store = configureReduxStore({
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
      })
        .concat(sagaMiddleware)
        .concat(middleware ?? ([] as Middlewares<S>)),
    devTools: finalDevToolsOptions,
  });

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

  return {
    store: {
      ...store,
      waitUntilStateRestored: async () => stateLoaded.promise,
      clear: persistor.purge,
      runSaga: sagaMiddleware.run,
    } as any as PersistableStore<
      S,
      A,
      MiddlewareArray<[ThunkMiddleware<S, A>, SagaMiddleware<C>, ...M]>
    >,
    persistor,
  };
}
