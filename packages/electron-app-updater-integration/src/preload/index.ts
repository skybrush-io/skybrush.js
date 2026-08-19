import { ipcRenderer as ipc } from 'electron-better-ipc';

import { contextBridge } from 'electron';
import { getEventEmitter, overrideApi } from '../core/api.js';
import { CONTEXT_API_KEY, IPC_NAMES } from '../core/constants.js';
import type { UpdateInfo, UpdaterApi } from '../core/types.js';

let _initialized: boolean = false;

/**
 * Initializes the updater integration in a renderer process and returns an API for
 * interacting with the updater.
 */
export function initialize(): UpdaterApi {
  if (_initialized) {
    throw new Error('Auto-updater is already initialized');
  }

  const emitter = getEventEmitter();

  ipc.answerMain(IPC_NAMES.setUpdateInfo, (info: UpdateInfo): void => {
    emitter.emit('state-changed', info);
  });

  const api = overrideApi({
    checkForUpdates: (options = {}) =>
      ipc.callMain(IPC_NAMES.checkForUpdates, options),
    isSupported: () => true,
    quitAndInstallUpdate: (options = {}) =>
      ipc.callMain(IPC_NAMES.quitAndInstallUpdate, options),
  });
  contextBridge.exposeInMainWorld(CONTEXT_API_KEY, api);

  _initialized = true;

  return api;
}
