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
      // 'active' is a tri-state variable. false means "connection is not active",
      // "true" means "connection should be active, try to reconnect if the
      // connection breaks". "null" is a special value meaning "Sidekick has
      // just started, so try connecting once and if it did not work, don't
      // try again"
      active: null,
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
