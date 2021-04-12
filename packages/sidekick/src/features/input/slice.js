/**
 * @file Slice of the state object that stores information related to the input
 * channel of the app (typically a connection to a Skybrush server).
 */

import { createSlice } from '@reduxjs/toolkit';

import ConnectionState from '~/model/ConnectionState';

const { actions, reducer } = createSlice({
  name: 'input',

  initialState: {
    server: {
      active: false,
      connectionState: ConnectionState.DISCONNECTED,
    },
  },

  reducers: {
    connectToServer(state) {
      state.server.active = true;
    },

    disconnectFromServer(state) {
      state.server.active = false;
    },

    setServerConnectionState(state, action) {
      const { payload } = action;

      if (ConnectionState.isValid(payload)) {
        state.server.connectionState = payload;
      }
    },
  },
});

export const {
  connectToServer,
  disconnectFromServer,
  setServerConnectionState,
} = actions;

export default reducer;
