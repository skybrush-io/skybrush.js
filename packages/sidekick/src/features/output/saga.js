import deferred from 'p-defer';
import { channel } from 'redux-saga';
import {
  call,
  delay,
  fork,
  join,
  put,
  race,
  select,
  take,
} from 'redux-saga/effects';

import {
  mavlink20,
  MAVLink20Processor,
} from '@skybrush/mavlink/lib/dialects/v20/ardupilotmega';

import { createMAVLinkMessagesFromCommand } from '~/features/flight/commands';
import {
  getEffectiveCommandRepeatCount,
  getEffectiveCommandRepeatDelay,
} from '~/features/settings/selectors';
import ConnectionState from '~/model/ConnectionState';

import {
  closeConnection,
  sendMessage,
  sendRawMessage,
  setConnectionState,
  setDevice,
} from './slice';

let requestChannel = null;

function* deviceHandlerSaga({
  deferred,
  nativePortObject,
  serialPort,
  baudRate,
}) {
  const port = nativePortObject;
  let portOpen = false;

  try {
    yield put(
      setDevice({
        type: 'serial',
        serialPort,
        baudRate,
      })
    );
    yield put(setConnectionState(ConnectionState.CONNECTING));

    yield call(async () => {
      await port.open({ baudRate });
      portOpen = true;
    });

    // Resolve the deferred so the part of the code that initiated the connection
    // now knows that the connection is open.
    if (deferred) {
      deferred.resolve();
    }

    yield put(setConnectionState(ConnectionState.CONNECTED));

    // The reader saga ensures that we can detect when the serial port is
    // disconnected. When the serial port is disconnected, the reader saga
    // exits, and race() will ensure that the writer saga is cancelled.
    yield race({
      reader: call(serialPortReaderSaga, port),
      writer: call(serialPortWriterSaga, port),
    });
  } catch {
    // An error happened while handling the serial port. If we did not even
    // manage to open it, we need to reject the deferred so the caller knows
    // about the failure
    if (!portOpen && deferred) {
      deferred.reject(new Error('Failed to open serial port.'));
    }
  } finally {
    // If we have opened the port, close it
    if (portOpen) {
      yield put(setConnectionState(ConnectionState.DISCONNECTING));
      yield call(() => port.close());
    }

    yield put(setConnectionState(ConnectionState.DISCONNECTED));
    yield put(setDevice(null));
  }
}

function* serialPortReaderSaga(port) {
  // Outer loop keeps constructing a reader as long as the port is readable.
  // When a fatal, non-recoverable error occurs, port.readable will become
  // falsy
  while (port.readable) {
    const reader = port.readable.getReader();

    try {
      while (true) {
        const { done } = yield call(() => reader.read());
        if (done) {
          break;
        }
      }
    } catch {
      console.error('Error while reading from serial port.');
    } finally {
      // We need to call reader.cancel() because of the following scenario.
      // When redux-saga decides to cancel the reader saga, it will throw an
      // exception from the yield call(() => reader.read()) line above. If we
      // try to call reader.releaseLock() first, it will block forever (if there
      // is nothing to read) because it is waiting for reader.read() to return.
      // Therefore, we need to force reader.read() to return by calling
      // reader.cancel(). We wrap the whole thing in a try..catch block in case
      // this behaviour changes in some later version of Chrome where calling
      // cancel() on a ReadableStream that was already cancelled will throw an
      // exception.
      try {
        reader.cancel();
      } catch {}

      reader.releaseLock();
    }
  }

  console.warn('Serial port reader stopped.');
}

function* serialPortWriterSaga(port) {
  const mavlinkEncoder = new MAVLink20Processor(
    /* logger */ null,
    /* srcSystem */ 253 /* TODO(ntamas): make  this configurable! */,
    /* srcComponent */ mavlink20.MAV_COMP_ID_MISSIONPLANNER
  );
  let finished = false;

  // Outer loop keeps constructing a writer and an encoder as long as the port
  // is writable. When a fatal, non-recoverable error occurs, port.writable
  // will become falsy
  while (!finished && port.writable) {
    const writer = port.writable.getWriter();

    try {
      // Provide a fake file for the MAVLink encoder that forwards everything to our
      // serial port writer
      mavlinkEncoder.file = {
        write: (buf) => {
          if (Array.isArray(buf)) {
            console.log('Writing', buf.length, 'bytes to serial port');
            console.log(buf);
            return writer.write(new Uint8Array(buf));
          }
        },
      };

      while (true) {
        const action = yield take([
          sendMessage.type,
          sendRawMessage.type,
          closeConnection.type,
        ]);

        switch (action.type) {
          case sendMessage.type:
            yield fork(serveMessageRequest, action, mavlinkEncoder);
            break;

          case sendRawMessage.type:
            yield call(serveRawMessageRequest, action, mavlinkEncoder);
            break;

          case closeConnection.type:
          default:
            finished = true;
            break;
        }
      }
    } catch {
      console.error('Error while writing to serial port.');
    } finally {
      writer.releaseLock();
    }
  }

  if (!finished) {
    console.warn('Serial port writer stopped unexpectedly.');
  }
}

function* serveMessageRequest(action, mavlinkEncoder) {
  const { payload } = action;
  let repeatCount = yield select(getEffectiveCommandRepeatCount);
  const repeatDelay = yield select(getEffectiveCommandRepeatDelay);

  while (repeatCount > 0) {
    const messages = createMAVLinkMessagesFromCommand(payload);
    const startedAt = performance.now();

    for (const message of messages) {
      yield call([mavlinkEncoder, mavlinkEncoder.send], message);
    }

    repeatCount--;

    if (repeatCount > 0 && repeatDelay > 0) {
      const expectedEnd = startedAt + repeatDelay;
      const toSleep = Math.max(expectedEnd - performance.now(), 0);
      yield delay(toSleep);
    }
  }
}

function* serveRawMessageRequest(action, mavlinkEncoder) {
  const { payload } = action;

  if (!Array.isArray(payload) || payload.length !== 2) {
    return;
  }

  const type = payload[0];
  const fields = payload[1];
  const MessageClass = mavlink20.messages[type.toLowerCase()];

  if (MessageClass) {
    const message = new MessageClass(...fields);
    yield call([mavlinkEncoder, mavlinkEncoder.send], message);
  } else {
    console.warn(`Dropped MAVLink message request with unknown type: ${type}`);
  }
}

function* outputSaga() {
  let task;

  requestChannel = channel();

  while (true) {
    const request = yield take(requestChannel);
    const { deferred, type } = request;

    try {
      // Stop the previous device handler saga and wait for its termination.
      // This is to ensure that only one task is invoking setConnectionState()
      // and setDevice() actions on its own. Note that we cannot use standard
      // task cancellation, because joining on a cancelled task would cancel
      // ourselves as well
      if (task) {
        yield put(closeConnection());
        yield race({
          res: join(task),
          timeout: delay(10 * 1000),
        });
        task = null;
      }

      // If needed, start a new device handler saga
      switch (type) {
        case 'none':
          deferred.resolve();

          break;

        case 'serial':
          task = yield fork(deviceHandlerSaga, request);
          break;

        default:
          throw new Error(`Unknown output device type: ${type}`);
      }
    } catch (error) {
      if (deferred) {
        deferred.reject(error);
      } else {
        console.error(error);
      }
    }
  }
}

/**
 * Requests the output saga to start handling the given serial port.
 * Returns a promise that resolves when the saga has successfully started
 * handling the given serial port.
 *
 * Passing <code>null</code> as the input parameter stops any existing serial
 * port handler saga but does not start a new one.
 *
 * Throws an exception if the saga fails to start.
 */
export async function startHandlingSerialPort({
  baudRate,
  serialPort,
  nativePortObject,
} = {}) {
  const request = {};

  if (serialPort) {
    request.type = 'serial';
    request.serialPort = serialPort;
    request.baudRate = baudRate;
    request.nativePortObject = nativePortObject;
  } else {
    request.type = 'none';
  }

  request.deferred = deferred();
  requestChannel.put(request);

  await request.deferred.promise;
}

/**
 * Requests the output saga to stop handling whatever serial port it is handling
 * now.
 *
 * Returns a promise that resolves when the saga has successfully stopped
 * handling the current serial port.
 */
export async function stopHandlingSerialPort() {
  await startHandlingSerialPort({});
}

export default outputSaga;
