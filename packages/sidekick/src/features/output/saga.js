import deferred from 'p-defer';
import { channel } from 'redux-saga';
import { call, delay, fork, join, put, race, take } from 'redux-saga/effects';

import {
  closeConnection,
  sendMessage,
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
    yield put(setConnectionState('connecting'));

    yield call(async () => {
      await port.open({ baudRate });
      portOpen = true;
    });

    // Resolve the deferred so the part of the code that initiated the connection
    // now knows that the connection is open.
    if (deferred) {
      deferred.resolve();
    }

    yield put(setConnectionState('connected'));

    // The reader saga ensures that we can detect when the serial port is
    // disconnected. When the serial port is disconnected, the reader saga
    // exits, and race() will ensure that the writer saga is cancelled.
    yield race([serialPortReaderSaga(port), serialPortWriterSaga(port)]);
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
      yield put(setConnectionState('disconnecting'));
      yield call(() => port.close());
    }

    yield put(setConnectionState('disconnected'));
    yield put(setDevice(null));
  }
}

function* serialPortReaderSaga(port) {
  // Outer loop keeps constructing a reader as long as the port is readable.
  // When a fatal, non-recoverable error occurs, port.readable will become
  // falsy
  console.log('Serial port reader started.');

  while (port.readable) {
    const reader = port.readable.getReader();

    try {
      while (true) {
        const { done, value } = yield call(() => reader.read());
        if (done) {
          // Reader was instructed to terminate
          break;
        }

        console.log('Read', value.length, 'bytes');
      }
    } catch {
      console.error('Error while reading from serial port.');
    } finally {
      reader.releaseLock();
    }
  }

  console.log('Serial port reader stopped.');
}

function* serialPortWriterSaga(port) {
  // Outer loop keeps constructing a writer and an encoder as long as the port
  // is writable. When a fatal, non-recoverable error occurs, port.writable
  // will become falsy
  console.log('Serial port writer started.');

  while (port.writable) {
    const textEncoder = new TextEncoder();
    const writer = port.writable.getWriter();

    try {
      while (true) {
        const action = yield take([sendMessage.type, closeConnection.type]);

        if (action.type === closeConnection.type) {
          break;
        }

        const data = textEncoder.encode(JSON.stringify(action) + '\n');

        yield call(() => writer.write(data));
        console.log('Written', data.length, 'bytes');

        // TODO(ntamas): handle setColor, setFlightMode, disarm
      }
    } catch {
      console.error('Error while writing to serial port.');
    } finally {
      writer.releaseLock();
    }
  }

  console.log('Serial port writer stopped.');
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
