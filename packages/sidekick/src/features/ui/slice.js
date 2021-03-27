/**
 * @file Slice of the state object that stores the application settings.
 */

import { createSlice } from '@reduxjs/toolkit';
import { noPayload } from '@skybrush/redux-toolkit';

const { actions, reducer } = createSlice({
  name: 'ui',

  initialState: {
    preferencesDialog: {
      visible: false,
      selectedTab: 'display',
    },
  },

  reducers: {
    closePreferencesDialog: noPayload((state) => {
      state.preferencesDialog.visible = false;
    }),

    showPreferencesDialog: noPayload((state) => {
      state.preferencesDialog.visible = true;
    }),
  },
});

export const { closePreferencesDialog, showPreferencesDialog } = actions;

export default reducer;
