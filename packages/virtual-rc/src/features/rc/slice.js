/**
 * @file Slice of the state object that stores the state of the output channels
 * of the virtual remote controller.
 */

import { createSlice } from '@reduxjs/toolkit';

const { actions, reducer } = createSlice({
  name: 'rc',

  initialState: {
    channels: [
      {
        label: 'Roll',
      },
      {
        label: 'Pitch',
      },
      {
        label: 'Thrt',
      },
      {
        label: 'Yaw',
      },
      {
        label: 'Mode',
        type: 'discrete',
        numStates: 6,
      },
      {
        label: 'Aux1',
        type: 'discrete',
        numStates: 2,
      },
      {
        label: 'Aux2',
        type: 'discrete',
        numStates: 2,
      },
      {
        label: 'Aux3',
        type: 'discrete',
        numStates: 2,
      },
    ],
    channelValues: [
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
      1500,
    ],
    numChannels: 8,
    on: true,
  },

  reducers: {
    setRCChannelValue(state, action) {
      const { index, value } = action.payload;
      if (
        index >= 0 &&
        index < state.channelValues.length &&
        typeof value === 'number'
      ) {
        state.channelValues[index] = value;
      }
    },

    setPowerSwitch(state, action) {
      state.on = Boolean(action.payload);
    },
  },
});

export const { setPowerSwitch, setRCChannelValue } = actions;

export default reducer;
