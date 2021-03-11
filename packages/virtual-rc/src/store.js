/**
 * @file The master store for the application state.
 */

import { combineReducers } from 'redux';
import { configureStoreAndPersistence } from '@skybrush/redux-toolkit';

import inputsReducer from './features/inputs/slice';
import rcReducer from './features/rc/slice';
import settingsReducer from './features/settings/slice';
import uiReducer from './features/ui/slice';

const reducer = combineReducers({
  inputs: inputsReducer,
  rc: rcReducer,
  settings: settingsReducer,
  ui: uiReducer,
});

/**
 * The store for the application state.
 */
export const { store, persistor } = configureStoreAndPersistence({
  reducer,

  storage: {
    key: 'skybrush-vrc',
    version: 1,
    blacklist: ['rc.channelValues'],
  },

  devTools: {},
});

export default store;
