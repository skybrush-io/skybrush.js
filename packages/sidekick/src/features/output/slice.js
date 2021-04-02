/**
 * @file Slice of the state object that stores information related to the output
 * channel of the app (typically a serial connection).
 */

import { createSlice } from '@reduxjs/toolkit';

const { actions, reducer } = createSlice({
  name: 'output',

  initialState: {
    device: null,
    serialPorts: [],
  },

  reducers: {
    sendMessage: {
      reducer: () => {},
      prepare: (type, args = {}) => ({ payload: { type, args } }),
    },

    setSerialPorts(state, action) {
      const { payload } = action;
      if (Array.isArray(payload)) {
        const newPorts = [];
        for (const port of payload) {
          newPorts.push({ ...port });
        }

        state.serialPorts = newPorts;
      }
    },
  },
});

export const { sendMessage, setSerialPorts } = actions;

export default reducer;
