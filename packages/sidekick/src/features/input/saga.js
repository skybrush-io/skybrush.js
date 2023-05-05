import { toByteArray } from 'base64-js';
import { buffers, eventChannel, END } from 'redux-saga';
import {
  cancel,
  delay,
  fork,
  join,
  race,
  select,
  put,
  take,
  call,
} from 'redux-saga/effects';

import { getServerConnectionSettings } from '~/features/settings/selectors';
import {
  addToCounter,
  clearCounter,
  Counters,
} from '~/features/stats/counters';
import { sendRawMessage } from '~/features/output/slice';
import { updateUAVErrorCodes } from '~/features/uavs/actions';
import { resetUAVState } from '~/features/uavs/slice';
import ConnectionState from '~/model/ConnectionState';

import { setServerConnectionActive } from './actions';
import {
  isServerConnectionActive,
  wasConnectionAttemptedAfterStartup,
} from './selectors';
import {
  connectToServer,
  disconnectFromServer,
  setServerConnectionState,
} from './slice';

/**
 * Creates a Redux-saga event channel that is fed by events coming from the
 * given Node.js readable stream.
 */
function createIncomingDataChannel(stream) {
  return eventChannel((emitter) => {
    const emitData = (data) => emitter({ type: 'data', data });
    const emitEnd = () => emitter(END);
    const emitError = (error) => emitter({ type: 'error', error });

    stream.on('data', emitData);
    stream.on('end', emitEnd);
    stream.on('error', emitError);

    return () => {
      stream.off('data', emitData);
      stream.off('end', emitEnd);
      stream.off('error', emitError);
    };
  }, buffers.sliding(16));
}

/**
 * Saga that attempts to connect to the server currently specified in the
 * connection settings of the application and that keeps on re-trying the
 * connection if it fails.
 */
function* connectionSaga() {
  const { host, port } = yield select(getServerConnectionSettings);
  let isActive = typeof host === 'string' && host.length > 0;

  // Note that we attempt to connect unconditionally. This is good because we
  // always want to try to connect when the app starts and we already have a
  // configured host.

  while (isActive) {
    // Run a single connection attempt
    try {
      yield call(attemptSingleConnection, { host, port });
    } catch (error) {
      const message = String(error);
      if (!message.includes('ECONNREFUSED')) {
        console.error(error);
      }
    }

    // Connection closed, wait a bit and then see if we need to retry.
    yield delay(1000);

    // Is the connection still active?
    isActive = yield select(isServerConnectionActive);
  }
}

/**
 * Saga that attempts a single connection to the server at the given hostname
 * and port, and returns when the connection terminates. Throws an error if the
 * connection is unsuccessful.
 */
function* attemptSingleConnection() {
  const { host, port } = yield select(getServerConnectionSettings);
  let connection;

  try {
    yield put(setServerConnectionState(ConnectionState.CONNECTING));

    // Create the connection
    const result = yield race({
      connection: call(window.bridge.createServerConnection, { host, port }),
      cancelled: take(disconnectFromServer.type),
    });
    if (result.connection) {
      connection = result.connection;
      yield put(setServerConnectionState(ConnectionState.CONNECTED));

      // Reset the packet counts when we have connected to the server
      clearCounter(Counters.SERVER);

      // Also clear any previous known states -- we may have connected to
      // a different server now so anything we know is outdated
      yield put(resetUAVState());

      // Successful connection. If this was the first attempt right after
      // startup, let's make ourselves permanently active.
      const wasConnectionAttempted = yield select(
        wasConnectionAttemptedAfterStartup
      );
      if (!wasConnectionAttempted) {
        yield put(setServerConnectionActive(true));
      }
    }

    // Read incoming messages in a separate task if we are still active and
    // the user has not started disconnection in the meanwhile
    const isActive = yield select(isServerConnectionActive);
    if (isActive && connection) {
      const task = yield fork(messageReaderSaga, connection);
      const result = yield race({
        action: take(disconnectFromServer.type),
        readerTerminated: join(task),
      });
      if (result.action) {
        // User asked to disconnect so we need to stop the task
        yield cancel(task);
      }
    }
  } finally {
    yield put(setServerConnectionState(ConnectionState.DISCONNECTING));
    if (connection) {
      yield call(connection.close);
    }

    yield put(setServerConnectionState(ConnectionState.DISCONNECTED));
  }
}

/**
 * Saga that reads messages from the given established server connection and
 * processes them.
 */
function* messageReaderSaga(connection) {
  const channel = createIncomingDataChannel(connection);

  try {
    while (true) {
      const { type, data } = yield take(channel);

      addToCounter(Counters.SERVER, 1);

      if (type === 'error' || type === 'end') {
        /* Connection closed, stop the task */
        break;
      } else if (type === 'data' && typeof data === 'object') {
        /* Received a message; process it */
        yield* processMessage(data);
      }
    }
  } catch (error) {
    console.error(`Unexpected error in incoming message reader saga: ${error}`);
  } finally {
    channel.close();
  }
}

/**
 * Processes a single message that was received from the Skybrush server.
 */
function* processMessage({ type, data }) {
  switch (type) {
    case 'rtk':
      // MAVLink specifications of RTK correction packets, to be forwarded
      // to the radio
      yield* processRTKMessage(data);
      break;

    case 'status.v1':
      // Status summary packet that we use to update the UI
      yield* processStatusSummaryMessage(data);
      break;

    default:
      console.warn('Unhandled message type:', type);
  }
}

/**
 * Processes a single RTK correction message that was received from the
 * Skybrush server.
 */
function* processRTKMessage(data) {
  for (const spec of Array.isArray(data) ? data : []) {
    if (Array.isArray(spec) && spec.length === 2) {
      const messageType = spec[0];

      let fields = spec[1];
      const length = fields.len;
      const payload = Array.from(toByteArray(fields.data));
      fields =
        messageType === 'GPS_RTCM_DATA'
          ? [fields.flags, length, payload]
          : null;

      if (fields) {
        yield put(sendRawMessage(messageType, fields));
        addToCounter(Counters.RTK, length);
      }
    }
  }
}

/**
 * Processes a single status summary message that was received from the
 * Skybrush server.
 */
function* processStatusSummaryMessage(data) {
  if (!Array.isArray(data) && data.length < 2) {
    // Malformed packet, ignore it
    return;
  }

  // For the time being we ignore the network ID; this means that we can only
  // safely support one MAVLink network. This will be fixed later.
  const [networkId, startIndex, ...errorCodes] = data;
  if (typeof networkId !== 'string') {
    return;
  }

  yield put(updateUAVErrorCodes(startIndex, errorCodes));
}

function* inputSaga() {
  let connectionTask = null;

  while (true) {
    let isActive = yield select(isServerConnectionActive);

    if (!isActive) {
      const wasConnectionAttempted = yield select(
        wasConnectionAttemptedAfterStartup
      );
      if (!wasConnectionAttempted) {
        isActive = true;
      }
    }

    if (isActive && (!connectionTask || !connectionTask.isRunning())) {
      connectionTask = yield fork(connectionSaga);
    } else if (!isActive && connectionTask) {
      yield put(disconnectFromServer());
      yield join(connectionTask);
      connectionTask = null;
    }

    yield take([connectToServer.type, disconnectFromServer.type]);
  }
}

export default inputSaga;