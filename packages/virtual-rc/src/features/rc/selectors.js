import { createSelector } from '@reduxjs/toolkit';

/**
 * Returns an array containing the preferred labels for each RC channel.
 */
export const getRCChannelLabels = createSelector(
  (state) => state.rc.channels,
  (state) => state.rc.numChannels,
  (channelSpec, numberChannels) => {
    const result = channelSpec.map((channelSpec) => channelSpec.label);
    result.length = Math.max(result.length, numberChannels);
    return result.map((label, index) => label || `Ch${index}`);
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
