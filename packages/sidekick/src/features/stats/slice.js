/**
 * @file State slice responsible for storing basic statistics about the number
 * of packets/bytes sent and received.
 */

import { createSlice } from '@reduxjs/toolkit';

const { actions, reducer } = createSlice({
  name: 'stats',

  initialState: {
    rtk: {
      packetsSent: 0,
      bytesSent: 0,
      recency: 0,
      timestamp: null,
    },
    output: {
      packetsSent: 0,
      bytesSent: 0,
    },
    server: {
      packetsReceived: 0,
      bytesReceived: 0,
      lastStatusUpdateReceivedAt: null,
    },
  },

  reducers: {
    updateRTKStatistics(state, action) {
      const { payload } = action;

      if (typeof payload.packetsSent === 'number') {
        state.rtk.packetsSent = payload.packetsSent;
      }

      if (typeof payload.bytesSent === 'number') {
        state.rtk.bytesSent = payload.bytesSent;
      }

      if (typeof payload.timestamp === 'number') {
        state.rtk.timestamp = payload.timestamp;
      }

      if (typeof payload.recency === 'number') {
        state.rtk.recency = payload.recency;
      }
    },
  },
});

export const { updateRTKStatistics } = actions;

export default reducer;
