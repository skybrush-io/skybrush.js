/**
 * @file State slice to handle a single confirmation dialog that is agnostic of the
 * action that it confirms.
 */

import { createSlice } from '@reduxjs/toolkit';
import { noPayload } from '@skybrush/redux-toolkit';

const { actions, reducer } = createSlice({
  name: 'confirmation',

  initialState: {
    actionToConfirm: null,
    message: '',
    title: '',
  },

  reducers: {
    clearConfirmation: noPayload((state) => {
      state.actionToConfirm = null;
      state.message = '';
      state.title = '';
    }),

    requestConfirmation(state, action) {
      const { payload } = action;
      const { action: actionToConfirm, message, title } = payload;

      state.actionToConfirm = actionToConfirm;
      state.message = message;
      state.title = String(title || '');
    },
  },
});

export const { clearConfirmation, requestConfirmation } = actions;

export default reducer;
