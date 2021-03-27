/**
 * @file The master store for the application state.
 */

import { combineReducers } from 'redux';
import { configureStoreAndPersistence } from '@skybrush/redux-toolkit';

import settingsReducer from './features/settings/slice';
import uiReducer from './features/ui/slice';

const reducer = combineReducers({
  settings: settingsReducer,
  ui: uiReducer,
});

/**
 * The store for the application state.
 */
export const { store, persistor } = configureStoreAndPersistence({
  reducer,

  storage: {
    key: 'skybrush-sidekick',
    version: 1,
    blacklist: [],
  },

  devTools: {},
});

export default store;
