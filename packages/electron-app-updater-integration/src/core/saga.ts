import { cancel, delay, fork, join, put, race, take } from 'redux-saga/effects';

import { buffers, eventChannel, type Task } from 'redux-saga';
import { getApi } from './api.js';
import {
  checkForUpdates as checkForUpdatesAction,
  installUpdate,
  setCheckInProgress,
  setUpdateError,
  setUpdateInfo,
  setUpdateSupported,
} from './slice.js';
import type { UpdateError, UpdateInfo, UpdaterApi } from './types.js';

/** Number of seconds to wait before the first update check. */
const INITIAL_UPDATE_CHECK_DELAY_SEC = 5;

/** Number of seconds to wait between consecutive update checks. */
const UPDATE_CHECK_INTERVAL_SEC = 30 * 60; // 30 minutes

type UpdaterSagaOptions = {
  initialUpdateCheckDelaySec?: number;
  updateCheckIntervalSec?: number;
};

/**
 * Saga that checks for app updates periodically and watches state changes from the
 * updater subsystem.
 *
 * @param options - Options for configuring the updater saga.
 */
export function* autoUpdaterSaga(
  options: UpdaterSagaOptions = {}
): Generator<any, void, any> {
  const updater = getApi();
  const { isSupported } = updater ?? {};
  if (!isSupported?.()) {
    return;
  }

  while (true) {
    const eventWatcherTask: Task<void> = yield fork(
      watchUpdaterEvents,
      updater!
    );
    const actionWatcherTask: Task<void> = yield fork(
      watchActions,
      updater!,
      options
    );

    try {
      yield join(actionWatcherTask);
      break;
    } catch (error) {
      console.error('Updater action watcher task failed:', error);
    } finally {
      // If the action watcher task terminates, it means that the updater is not supported
      // in the current environment so we can cancel the event watcher task.
      yield cancel(eventWatcherTask);
    }

    // Wait a bit before respawning
    yield delay(1000);
  }
}

/**
 * Sags that watches events dispatched by the updater subsystem and dispatches
 * actions into the Redux store as needed.
 */
function* watchUpdaterEvents(updater: UpdaterApi): Generator<any, void, any> {
  const { subscribe } = updater;
  const channel = eventChannel<UpdateInfo>(
    (emitter) => subscribe('state-changed', emitter),
    buffers.sliding(5)
  );

  while (true) {
    const updateInfo = yield take(channel);
    yield put(setUpdateInfo(updateInfo));
  }
}

/**
 * Saga that watches update-related actions dispatched by Redux and calls the
 * corresponding updater API methods.
 *
 * @param updater - The updater API object.
 * @param options - Options for configuring the updater saga.
 */
function* watchActions(
  updater: UpdaterApi,
  options: UpdaterSagaOptions
): Generator<any, void, any> {
  const { checkForUpdates, quitAndInstallUpdate } = updater!;
  const {
    initialUpdateCheckDelaySec = INITIAL_UPDATE_CHECK_DELAY_SEC,
    updateCheckIntervalSec = UPDATE_CHECK_INTERVAL_SEC,
  } = options;

  yield put(setUpdateSupported(true));

  let first = true;

  while (true) {
    const nextDelay = first
      ? initialUpdateCheckDelaySec
      : updateCheckIntervalSec;
    first = false;

    const result = yield race({
      delay: delay(nextDelay * 1000, true),
      check: take(checkForUpdatesAction),
      install: take(installUpdate),
    });
    let updateError: UpdateError | null = null;

    if (result.install) {
      try {
        yield quitAndInstallUpdate();
      } catch (error) {
        console.error('Error while installing update:', error);
        updateError = 'installFailed';
      }

      yield put(setUpdateError(updateError));
    } else {
      const invokedByUser = !!result.check;

      yield put(setCheckInProgress(true));
      try {
        yield checkForUpdates({ silent: !invokedByUser });
        // setUpdateInfo() will be called by the main process via RPC
      } catch (error) {
        if (invokedByUser) {
          console.error('Error while checking for updates:', error);
          updateError = 'checkFailed';
        }
      } finally {
        // We tried to use a minimum delay of 1 second here to make the UI look nicer
        // (no quick flash of the progress bar). However, this causes confusing user
        // feedback when the download is already downloaded as we will briefly display
        // 'Installing update' before falling back to a non-loading state.
        yield put(setCheckInProgress(false));
      }

      if (invokedByUser) {
        // Do not update the error in the state if the check was automatic; we do not
        // want to show an error message if an automatic check fails due to the
        // system being offline.
        yield put(setUpdateError(updateError));
      }
    }
  }
}

export default autoUpdaterSaga;
