/**
 * @file Slice of the state object that stores the configured input devices.
 */

import { createSlice } from '@reduxjs/toolkit';

const { /* actions, */ reducer } = createSlice({
  name: 'inputs',

  initialState: {
    byId: {
      primaryGamepad: {
        id: 'primaryGamepad',
        type: 'gamepad',
        parameters: {
          index: 0,
        },
      },

      keyboard: {
        id: 'keyboard',
        type: 'keyboard',
        parameters: {},
      },
    },
    order: ['primaryGamepad', 'keyboard'],
  },

  reducers: {},
});

// export const  {} = actions;

export default reducer;
