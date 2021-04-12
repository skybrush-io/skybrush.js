/**
 * @file Slice of the state object that stores the application settings.
 */

import isNil from 'lodash-es/isNil';

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

    selectedUAVId: null,

    sidebarWidth: 240,
  },

  reducers: {
    closeOutputDeviceDialog: noPayload((state) => {
      state.outputDeviceDialog.visible = false;
    }),

    closePreferencesDialog: noPayload((state) => {
      state.preferencesDialog.visible = false;
    }),

    setSelectedTabInPreferencesDialog: (state, action) => {
      const { payload } = action;
      if (payload && typeof payload === 'string') {
        state.preferencesDialog.selectedTab = payload;
      }
    },

    setSelectedUAVId: (state, action) => {
      const { payload } = action;
      if (isNil(payload) || typeof payload === 'number') {
        state.selectedUAVId = payload;
      }
    },

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
  setSelectedUAVId,
  setSelectedTabInPreferencesDialog,
  setSidebarWidth,
  showOutputDeviceDialog,
  showPreferencesDialog,
} = actions;

export default reducer;
