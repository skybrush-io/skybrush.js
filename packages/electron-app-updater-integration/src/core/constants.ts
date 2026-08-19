import type { UpdateInfo } from './types.js';

/**
 * Context API key used internally by the integration to expose the updater API
 * from the preloader to the main renderer process.
 */
export const CONTEXT_API_KEY = '__electron_app_updater_integration_api__';

/**
 * Names of the IPC functions used to communicate between Electron's main and
 * renderer processes.
 */
export const IPC_NAMES = {
  checkForUpdates: '__autoUpdater_checkForUpdates',
  quitAndInstallUpdate: '__autoUpdater_quitAndInstallUpdate',
  setUpdateInfo: '__autoUpdater_setUpdateInfo',
};

/** Constant that indicates that there are no updates available. */
export const NO_UPDATES: UpdateInfo = Object.freeze({
  available: false,
  downloaded: false,
  downloadProgress: null,
  version: null,
});
