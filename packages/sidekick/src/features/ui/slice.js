/**
 * @file Slice of the state object that stores the application settings.
 */

import { createSlice } from '@reduxjs/toolkit';
import { noPayload } from '@skybrush/redux-toolkit';

const { actions, reducer } = createSlice({
  name: 'ui',

  initialState: {
    outputDeviceDialog: {
      visible: false,
    },

    preferencesDialog: {
      visible: false,
      selectedTab: 'display',
    },

    sidebarWidth: 240,
  },

  reducers: {
    closeOutputDeviceDialog: noPayload((state) => {
      state.outputDeviceDialog.visible = false;
    }),

    closePreferencesDialog: noPayload((state) => {
      state.preferencesDialog.visible = false;
    }),

    setSidebarWidth: (state, action) => {
      const { payload } = action;
      const width =
        typeof payload === 'number' && payload > 0 ? payload : Number.NaN;
      if (!Number.isNaN(width)) {
        state.sidebarWidth = width;
      }
    },

    showOutputDeviceDialog: noPayload((state) => {
      state.outputDeviceDialog.visible = true;
    }),

    showPreferencesDialog: noPayload((state) => {
      state.preferencesDialog.visible = true;
    }),
  },
});

export const {
  closeOutputDeviceDialog,
  closePreferencesDialog,
  setSidebarWidth,
  showOutputDeviceDialog,
  showPreferencesDialog,
} = actions;

export default reducer;
