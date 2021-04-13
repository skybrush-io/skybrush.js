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
      timestamp: null,
    },
    server: {
      packetsReceived: 0,
      bytesReceived: 0,
      timestamp: null,
    },
  },

  reducers: {
    updateOutputStatistics(state, action) {
      const { payload } = action;

      if (typeof payload.packetsSent === 'number') {
        state.output.packetsSent = payload.packetsSent;
      }

      if (typeof payload.bytesSent === 'number') {
        state.output.bytesSent = payload.bytesSent;
      }

      if (typeof payload.timestamp === 'number') {
        state.output.timestamp = payload.timestamp;
      }
    },

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

    updateServerStatistics(state, action) {
      const { payload } = action;

      console.log(payload);

      if (typeof payload.packetsReceived === 'number') {
        state.server.packetsReceived = payload.packetsReceived;
      }

      if (typeof payload.bytesReceived === 'number') {
        state.server.bytesReceived = payload.bytesReceived;
      }

      if (typeof payload.timestamp === 'number') {
        state.server.timestamp = payload.timestamp;
      }
    },
  },
});

export const {
  updateServerStatistics,
  updateOutputStatistics,
  updateRTKStatistics,
} = actions;

export default reducer;
