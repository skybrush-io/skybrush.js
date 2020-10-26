import { createSelector } from '@reduxjs/toolkit';

import { selectOrdered } from '@skybrush/redux-toolkit/lib/collections';

/**
 * Selects the list of input devices to use, in the order they should be
 * considered.
 */
export const getInputDevicesInOrder = createSelector(
  (state) => state.inputs,
  selectOrdered
);
