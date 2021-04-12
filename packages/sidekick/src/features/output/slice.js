/**
 * @file Slice of the state object that stores information related to the output
 * channel of the app (typically a serial connection).
 */

import isNil from 'lodash-es/isNil';
import { createSlice } from '@reduxjs/toolkit';

import ConnectionState from '~/model/ConnectionState';

const { actions, reducer } = createSlice({
  name: 'output',

  initialState: {
    device: null, // must be of the format: { "type": "serial", "serialPort": ..., "baudRate": ... }
    connectionState: ConnectionState.DISCONNECTED,
    serialPorts: [],
  },

  reducers: {
    closeConnection() {
      // Nop; it is only used in the output saga
    },

    sendMessage() {
      // Nop; it is only used in the output saga
    },

    sendRawMessage: {
      prepare: (type, fields) => ({ payload: [type, fields] }),
      reducer() {
        // Nop; it is only used in the output saga
      },
    },

    setConnectionState(state, action) {
      const { payload } = action;

      if (ConnectionState.isValid(payload)) {
        state.connectionState = payload;
      }
    },

    setDevice(state, action) {
      const { payload } = action;

      if (
        typeof payload === 'object' &&
        (isNil(payload) || typeof payload.type === 'string')
      ) {
        state.device = payload;
      }
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

export const {
  closeConnection,
  sendMessage,
  sendRawMessage,
  setConnectionState,
  setDevice,
  setSerialPorts,
} = actions;

export default reducer;
