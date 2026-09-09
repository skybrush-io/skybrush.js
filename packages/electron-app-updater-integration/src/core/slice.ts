/**
 * @file Slice of the state object that stores the status of the auto-update functionality
 * of the application.
 */

import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type { UpdateError, UpdateInfo } from './types.js';

type AutoUpdateSliceState = {
  /** Whether the application is currently checking for updates. */
  checking: boolean;
  /** Error during the last check or installation attempt, if any. */
  error: UpdateError | null;
  /** Whether the application is currently installing an update. */
  installing: boolean;
  /** Whether auto-updates are supported in the current application. */
  supported: boolean;
  /** Information about the available update, if any. */
  updateInfo: UpdateInfo;
};

const initialState: AutoUpdateSliceState = {
  checking: false,
  error: null,
  installing: false,
  supported: false,
  updateInfo: {
    available: false,
    downloaded: false,
    downloadProgress: null,
    version: null,
  },
};

const { actions, reducer, selectors } = createSlice({
  name: 'autoUpdate',
  initialState,

  reducers: {
    checkForUpdates() {
      /* nothing to do, the saga will handle it */
    },

    installUpdate() {
      /* nothing to do, the saga will handle it */
    },

    setCheckInProgress(state, action: PayloadAction<boolean>) {
      const { payload } = action;
      state.checking = payload;
    },

    setInstallInProgress(state, action: PayloadAction<boolean>) {
      const { payload } = action;
      state.installing = payload;
    },

    setUpdateError(state, action: PayloadAction<UpdateError | null>) {
      const { payload } = action;
      state.error = payload;
    },

    setUpdateInfo(state, action: PayloadAction<UpdateInfo>) {
      const { payload } = action;
      state.updateInfo = payload;
    },

    setUpdateSupported(state, action: PayloadAction<boolean>) {
      const { payload } = action;
      state.supported = payload;
    },
  },

  selectors: {
    selectAutoUpdateState: createSelector(
      [
        (state: AutoUpdateSliceState) => state.error,
        (state: AutoUpdateSliceState) => state.checking,
        (state: AutoUpdateSliceState) => state.installing,
        (state: AutoUpdateSliceState) => state.supported,
        (state: AutoUpdateSliceState) => state.updateInfo,
      ],
      (error, checking, installing, supported, updateInfo) => ({
        error,
        isCheckingForUpdates: checking,
        isDownloadingUpdate: typeof updateInfo.downloadProgress === 'number',
        isInstallingUpdate: installing,
        downloadProgress: updateInfo.downloadProgress,
        updateAvailable: updateInfo.available,
        updateDownloaded: updateInfo.downloaded,
        updateSupported: supported,
      })
    ),
  },
});

export const {
  checkForUpdates,
  installUpdate,
  setCheckInProgress,
  setInstallInProgress,
  setUpdateError,
  setUpdateInfo,
  setUpdateSupported,
} = actions;

export const { selectAutoUpdateState } = selectors;

export { actions, reducer };
