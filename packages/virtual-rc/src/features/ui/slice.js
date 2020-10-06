/**
 * @file Slice of the state object that stores the state of the UI.
 */

import { createSlice } from '@reduxjs/toolkit';

const { actions, reducer } = createSlice({
  name: 'ui',

  initialState: {
    screen: 'main',
  },

  reducers: {
    setCurrentScreen(state, action) {
      state.screen = String(action.payload);
    },
  },
});

export const { setCurrentScreen } = actions;

export default reducer;
