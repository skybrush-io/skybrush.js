/**
 * @file Slice of the state object that stores the application settings.
 */

import { createSlice } from '@reduxjs/toolkit';

const { actions, reducer } = createSlice({
  name: 'settings',

  initialState: {
    theme: 'auto',
  },

  reducers: {
    setTheme(state, action) {
      state.theme = String(action.payload);
    },
  },
});

export const { setTheme } = actions;

export default reducer;
