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
    resetUAVState: noPayload(clearState),
  },
});

export const { resetUAVState } = actions;

export default reducer;
