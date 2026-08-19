export type CheckForUpdateOptions = {
  silent?: boolean;
};

/**
 * Object describing the full state of the updater.
 */
export type UpdateInfo = {
  available: boolean;
  downloaded: boolean;
  downloadProgress: number | null;
  version: string | null;
};

/**
 * Events emitted by the updater subsystem.
 */
export interface UpdaterEvents {
  'state-changed': (state: UpdateInfo) => void;
}

/**
 * Async API provided in the renderer side that can be used to interact with the updater.
 */
export interface UpdaterApi {
  checkForUpdates(options?: CheckForUpdateOptions): Promise<UpdateInfo>;
  isSupported(): boolean;
  quitAndInstallUpdate(options?: CheckForUpdateOptions): Promise<void>;
  subscribe<E extends keyof UpdaterEvents>(
    event: E,
    listener: UpdaterEvents[E]
  ): () => void;
}

/**
 * Types of actions that can be performed from an update-related React component.
 */
export type UpdateAction = 'check' | 'download' | 'install';

/**
 * Error codes set by the updater saga in the state slice when an error happens during
 * an update attempt.
 */
export type UpdateError = 'checkFailed' | 'downloadFailed' | 'installFailed';
