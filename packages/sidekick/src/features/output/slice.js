/**
 * @file Slice of the state object that stores information related to the output
 * channel of the app (typically a serial connection).
 */

import { createSlice } from '@reduxjs/toolkit';

const { actions, reducer } = createSlice({
  name: 'output',

  initialState: {},

  reducers: {
    sendMessage: {
      reducer: () => {},
      prepare: (type, args = {}) => ({ payload: { type, args } }),
    },
  },
});

export const { sendMessage } = actions;

export default reducer;
