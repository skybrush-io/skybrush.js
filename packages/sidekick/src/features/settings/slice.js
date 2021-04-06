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
    commands: {
      confirm: {
        broadcast: true,
        unicast: false,
      },
      repeat: {
        enabled: true,
        count: 5,
        delay: 100,
      },
    },
  },

  reducers: {
    setCommandConfirmationProperties(state, action) {
      const { payload } = action;

      if (typeof payload === 'object') {
        if (typeof state.commands.confirm === 'undefined') {
          state.commands.confirm = {};
        }

        if (typeof payload.broadcast !== 'undefined') {
          state.commands.confirm.broadcast = Boolean(payload.broadcast);
        }

        if (typeof payload.unicast !== 'undefined') {
          state.commands.confirm.unicast = Boolean(payload.unicast);
        }
      }
    },

    setCommandRepeatingProperties(state, action) {
      const { payload } = action;

      if (typeof payload === 'object') {
        if (typeof payload.enabled !== 'undefined') {
          state.commands.repeat.enabled = Boolean(payload.enabled);
        }

        if (typeof payload.count === 'number' && payload.count >= 1) {
          state.commands.repeat.count = Math.floor(payload.count);
        }

        if (
          typeof payload.delay === 'number' &&
          payload.delay >= 0 &&
          Number.isFinite(payload.delay)
        ) {
          state.commands.repeat.delay = Math.min(1000, payload.delay);
        }
      }
    },

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
  setCommandConfirmationProperties,
  setCommandRepeatingProperties,
  setPreferredOutputDevice,
  setTheme,
  setUAVIdSpecification,
} = actions;

export default reducer;
