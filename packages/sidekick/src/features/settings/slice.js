/**
 * @file Slice of the state object that stores the application settings.
 */

import { createSlice } from '@reduxjs/toolkit';

const { actions, reducer } = createSlice({
  name: 'settings',

  initialState: {
    theme: 'auto',
    uavIdSpec: '1-250',
    preferredOutputDevice: {
      serialPort: null,
      baudRate: 57600,
    },
  },

  reducers: {
    setPreferredOutputDevice(state, action) {
      const { payload } = action;
      if (typeof payload === 'object') {
        state.preferredOutputDevice.serialPort =
          typeof payload.serialPort === 'string' ? payload.serialPort : null;
        if (typeof payload.baudRate === 'number') {
          state.preferredOutputDevice.baudRate = payload.baudRate;
        }
      }
    },

    setTheme(state, action) {
      state.theme = String(action.payload);
    },

    setUAVIdSpecification(state, action) {
      state.uavIdSpec = String(action.payload);
    },
  },
});

export const {
  setPreferredOutputDevice,
  setTheme,
  setUAVIdSpecification,
} = actions;

export default reducer;
