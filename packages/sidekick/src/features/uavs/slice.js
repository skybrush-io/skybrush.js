/**
 * @file Slice of the state object that stores the application settings.
 */

import { createSlice } from '@reduxjs/toolkit';
import { noPayload } from '@skybrush/redux-toolkit';

import { MAVLINK_NETWORK_SIZE } from '~/ardupilot';

const clearState = (state) => {
  for (let i = 0; i < MAVLINK_NETWORK_SIZE; i++) {
    state.byId[i] = {
      active: false,
      errorCode: 0,
    };
  }

  return state;
};

const { actions, reducer } = createSlice({
  name: 'uavs',

  initialState: clearState({
    byId: Array.from({ length: MAVLINK_NETWORK_SIZE }),
  }),

  reducers: {
    applyUAVStateDiff: (state, action) => {
      const { payload } = action;

      if (Array.isArray(payload)) {
        const numberOfUAVs = state.byId.length;

        for (let i = 0; i < payload.length; i += 2) {
          const uavId = payload[i];
          const updates = payload[i + 1];

          if (uavId >= 0 && uavId < numberOfUAVs) {
            state.byId[uavId] = {
              ...state.byId[uavId],
              ...updates,
            };
          }
        }
      }
    },

    resetUAVState: noPayload(clearState),
  },
});

export const { applyUAVStateDiff, resetUAVState } = actions;

export default reducer;
