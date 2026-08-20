import { app } from 'electron';
import { ipcMain as ipc } from 'electron-better-ipc';
// Do NOT import anything other than types from electron-updater here. Not even types.
// Even if this means that we need to use 'any' in this file. See the comment in the
// initialize() function around the deferred import of electron-updater for more details.

import { getFirstMainWindow } from '@skybrush/electron-app-framework';

import { overrideApi } from '../core/api.js';
import { IPC_NAMES, NO_UPDATES } from '../core/constants.js';
import type {
  CheckForUpdateOptions,
  UpdateInfo,
  UpdaterApi,
} from '../core/types.js';

let _autoUpdater: any | null = null;

type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};

export type UpdaterConfiguration = {
  log?: Logger | null | undefined;
};

/**
 * Initializes the auto-updater integration with the Electron application. This function
 * should be called once during the app's startup.
 *
 * @param log - The logger to use for the auto-updater
 */
export async function initialize({
  log,
}: UpdaterConfiguration = {}): Promise<UpdaterApi> {
  if (_autoUpdater) {
    throw new Error('Auto-updater is already configured');
  }

  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  //
  // Also note the deferred import. This is required to prevent the following import
  // chain during early startup:
  //
  // electron-updater -> builder-util-runtime -> debug
  //
  // This is needed because 'debug' attempts to modify process.env.DEBUG and this is
  // disallowed when the app is packaged, unless we patch it over with Webpack by
  // replacing 'process.env' with a custom object. Search for __runtime_process_env
  // in downstream code.
  const { autoUpdater } = (await import('electron-updater')).default;

  // Integrate with logger
  if (log) {
    autoUpdater.logger = log;
  }

  // Do not install updates on app quit because that could potentially leave the app
  // in a broken state if the app quits due to the system shutting down.
  //
  // When migrating to electron-updater v7 or later, this will have to be replaced with
  // autoUpdater.autoInstallEvent = 'onNextLaunch'.
  autoUpdater.autoInstallOnAppQuit = false;

  // Uncomment the following line to test the auto-updater in dev mode.
  // In this case you will also need to provide a file named dev-app-update.yml
  // in the root of your project
  if (!app.isPackaged) {
    autoUpdater.forceDevUpdateConfig = true;
  }

  // Set up IPC handlers for requests coming from the renderer process
  ipc.answerRenderer(IPC_NAMES.checkForUpdates, checkForUpdates);
  ipc.answerRenderer(IPC_NAMES.quitAndInstallUpdate, quitAndInstallUpdate);

  // Register a function to be called every time the status of the auto-updater changes.
  registerUpdateListener(autoUpdater, (info) => {
    const mainWindow = getFirstMainWindow();
    if (mainWindow) {
      ipc
        .callRenderer(mainWindow, IPC_NAMES.setUpdateInfo, info)
        .catch((err) => {
          _autoUpdater?.logger?.error(
            `Failed to notify renderer about update status: ${err}`
          );
        });
    }
  });

  _autoUpdater = autoUpdater;

  return overrideApi({
    checkForUpdates,
    isSupported: () => true,
    quitAndInstallUpdate: async (options = {}) => quitAndInstallUpdate(options),
  });
}

export function getAutoUpdater() {
  if (!_autoUpdater) {
    throw new Error(
      'Auto-updater is not initialized. Call initialize() first.'
    );
  }

  return _autoUpdater;
}

/**
 * Checks for updates.
 *
 * @param silent - If true, errors will be logged to the logger (if configured) and
 *        otherwise ignored silently.
 * @returns - The current state of the updater after the check.
 */
async function checkForUpdates(
  options: CheckForUpdateOptions = {}
): Promise<UpdateInfo> {
  const { silent } = options;

  try {
    const result = await getAutoUpdater().checkForUpdates();
    return result?.isUpdateAvailable
      ? Object.freeze({
          available: true,
          downloaded: result?.updateInfo?.version ? true : false,
          downloadProgress: null,
          version: result?.updateInfo?.version ?? null,
        })
      : NO_UPDATES;
  } catch (err) {
    if (!silent) {
      throw err;
    }
  }

  return NO_UPDATES;
}

/**
 * Quits the application and installs the update.
 *
 * @param silent - If true, errors will be logged to the logger (if configured) and
 *        otherwise ignored silently.
 */
function quitAndInstallUpdate(options: CheckForUpdateOptions = {}) {
  const { silent } = options;
  const autoUpdater = getAutoUpdater();

  try {
    autoUpdater.quitAndInstall();
  } catch (err) {
    if (!silent) {
      throw err;
    }
  }
}

/**
 * Registers a function to be called when the status of the auto-update service changes.
 *
 * @param autoUpdater - The auto-updater instance to listen to
 * @param callback - The function to call when the status changes
 * @returns - A function that can be called to unregister the callback
 */
function registerUpdateListener(
  autoUpdater: any,
  callback: (info: UpdateInfo) => void
): () => void {
  let lastUpdateInfo: any = null;

  const handleUpdateAvailable = (info: any) => {
    lastUpdateInfo = info;
    callback({
      available: true,
      downloaded: false,
      downloadProgress: autoUpdater.autoDownload ? 0 : null,
      version: info?.version ?? null,
    });
  };

  const handleUpdateDownloaded = (info: any) => {
    lastUpdateInfo = info;
    callback({
      available: true,
      downloaded: true,
      downloadProgress: null,
      version: info?.version ?? null,
    });
  };

  const handleUpdateNotAvailable = () => {
    lastUpdateInfo = null;
    callback(NO_UPDATES);
  };

  const handleDownloadProgress = (info: any) => {
    if (lastUpdateInfo) {
      callback({
        available: true,
        downloaded: false,
        downloadProgress: Math.round(info.percent * 100) / 100,
        version: lastUpdateInfo?.version ?? null,
      });
    }
  };

  autoUpdater.on('update-available', handleUpdateAvailable);
  autoUpdater.on('update-downloaded', handleUpdateDownloaded);
  autoUpdater.on('update-not-available', handleUpdateNotAvailable);
  autoUpdater.on('download-progress', handleDownloadProgress);

  return () => {
    autoUpdater.off('update-available', handleUpdateAvailable);
    autoUpdater.off('update-downloaded', handleUpdateDownloaded);
    autoUpdater.off('update-not-available', handleUpdateNotAvailable);
    autoUpdater.off('download-progress', handleDownloadProgress);
  };
}
