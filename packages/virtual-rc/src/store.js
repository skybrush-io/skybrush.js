/**
 * @file The master store for the application state.
 */

import { combineReducers } from 'redux';
import { configureStoreAndPersistence } from '@skybrush/redux-toolkit';

import rcReducer from './features/rc/slice';

const reducer = combineReducers({
  rc: rcReducer,
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

// Send the store dispatcher function back to the preloader
if (window.bridge) {
  window.bridge.dispatch = store.dispatch;
}

export default store;
