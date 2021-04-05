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
  let writer;

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

    writer = port.writable.getWriter();
    const textEncoder = new TextEncoder();

    while (true) {
      const action = yield take([sendMessage.type, closeConnection.type]);
      console.log(action);

      if (action.type === closeConnection.type) {
        break;
      }

      const data = textEncoder.encode(JSON.stringify(action) + '\n');
      console.log(data);

      yield call(() => writer.write(data));

      // TODO(ntamas): handle setColor, setFlightMode, disarm
    }
  } catch {
    // An error happened while handling the serial port. If we did not even
    // manage to open it, we need to reject the deferred so the caller knows
    // about the failure
    if (!portOpen && deferred) {
      deferred.reject(new Error('Failed to open serial port.'));
    }
  } finally {
    // Release the writer so the port can be closed later
    if (writer) {
      writer.releaseLock();
      writer = null;
    }

    // If we have opened the port, close it
    if (portOpen) {
      yield put(setConnectionState('disconnecting'));
      yield call(() => port.close());
    }

    yield put(setConnectionState('disconnected'));
    yield put(setDevice(null));
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
