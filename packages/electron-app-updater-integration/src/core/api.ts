import { TypedEmitter } from 'tiny-typed-emitter';
import { CONTEXT_API_KEY, NO_UPDATES } from './constants.js';
import type { UpdaterApi, UpdaterEvents } from './types.js';

const _eventEmitter = new TypedEmitter<UpdaterEvents>();

let _api: UpdaterApi = {
  checkForUpdates: async () => {
    // Nothing to do by default. Will be overridden by the main or the renderer
    // package during initialization when needed.
    return NO_UPDATES;
  },
  isSupported: () => {
    return false;
  },
  quitAndInstallUpdate: async () => {
    // Nothing to do by default. Will be overridden by the main or the renderer
    // package during initialization when needed.
  },
  subscribe: (event, listener) => {
    _eventEmitter.on(event, listener);
    return () => {
      _eventEmitter.off(event, listener);
    };
  },
};

export function getApi(): UpdaterApi {
  // If we are in the renderer process, fetch the API from the context bridge
  if (typeof window !== 'undefined' && (window as any)[CONTEXT_API_KEY]) {
    return (window as any)[CONTEXT_API_KEY];
  }

  // Otherwise, return the default API, which works in the main process, in the
  // preloader, or outside Electron.
  return _api;
}

export function getEventEmitter(): TypedEmitter<UpdaterEvents> {
  return _eventEmitter;
}

export function overrideApi(
  funcs: Partial<Omit<UpdaterApi, 'events'>>
): UpdaterApi {
  _api = {
    ..._api,
    ...funcs,
  };
  return _api;
}
