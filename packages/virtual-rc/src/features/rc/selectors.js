import { createSelector } from '@reduxjs/toolkit';

/**
 * Returns the number of RC channels.
 */
export const getNumberOfRCChannels = (state) => state.rc.numChannels;

/**
 * Returns an array containing the preferred labels for each RC channel.
 */
export const getRCChannelLabels = createSelector(
  (state) => state.rc.channels,
  getNumberOfRCChannels,
  (channelSpec, numberChannels) => {
    const result = channelSpec.map((channelSpec) => channelSpec.label);
    result.length = Math.max(result.length, numberChannels);
    return [...result].map((label, index) => label || `Ch${index}`);
  }
);

/**
 * Returns an array containing the current values of the RC channels.
 */
export function getRCChannelValues(state) {
  return state.rc.channelValues;
}

/**
 * Returns whether the virtual remote controller is turned on.
 */
export function isRCPowerSwitchOn(state) {
  return state.rc.on;
}
