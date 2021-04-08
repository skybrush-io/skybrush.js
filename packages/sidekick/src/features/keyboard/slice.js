/**
 * @file State slice responsible for storing temporary information related to keyboard handling.
 */

import { createSlice } from '@reduxjs/toolkit';

import { MAVLINK_NETWORK_SIZE } from '~/ardupilot';

const { actions, reducer } = createSlice({
  name: 'keyboard',

  initialState: {
    pendingUAVId: 0,
  },

  reducers: {
    setPendingUAVId(state, action) {
      const { payload } = action;

      if (
        typeof payload === 'number' &&
        payload >= 0 &&
        payload < MAVLINK_NETWORK_SIZE
      ) {
        state.pendingUAVId = payload;
      }
    },

    startPendingUAVIdTimeout() {
      /* nothing to do here, the saga will take care of it */
    },
  },
});

export const { setPendingUAVId, startPendingUAVIdTimeout } = actions;

export default reducer;
