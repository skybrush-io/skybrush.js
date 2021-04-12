/**
 * @file The master store for the application state.
 */

import { combineReducers } from 'redux';
import { configureStoreAndPersistence } from '@skybrush/redux-toolkit';

import confirmationReducer from './features/confirmation/slice';
import inputSaga from './features/input/saga';
import inputReducer from './features/input/slice';
import keyboardSaga from './features/keyboard/saga';
import keyboardReducer from './features/keyboard/slice';
import outputSaga from './features/output/saga';
import outputReducer from './features/output/slice';
import settingsReducer from './features/settings/slice';
import statsSaga from './features/stats/saga';
import statsReducer from './features/stats/slice';
import uiReducer from './features/ui/slice';

const reducer = combineReducers({
  confirmation: confirmationReducer,
  input: inputReducer,
  keyboard: keyboardReducer,
  output: outputReducer,
  settings: settingsReducer,
  stats: statsReducer,
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
    blacklist: [
      'confirmation',
      'input',
      'keyboard',
      'output',
      'stats',
      'ui.selectedUAVId',
    ],
  },

  devTools: {},

  sagas: [keyboardSaga, inputSaga, outputSaga, statsSaga],
});

export default store;
