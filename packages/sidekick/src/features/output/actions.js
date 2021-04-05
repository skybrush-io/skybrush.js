import { showOutputDeviceDialog } from '~/features/ui/slice';

import { startHandlingSerialPort, stopHandlingSerialPort } from './saga';
import { setSerialPorts } from './slice';

/**
 * Action creator that requests the list of serial ports from Electron and
 * _then_ opens the "output devices" dialog.
 */
export function requestSerialPortsAndShowOutputDeviceDialog() {
  return async (dispatch) => {
    await dispatch(refreshSerialPortList());
    dispatch(showOutputDeviceDialog());
  };
}

/**
 * Action creator that refreshes the list of serial ports from Electron.
 */
export function refreshSerialPortList() {
  return async (dispatch) => {
    const ports = await window.bridge.getSerialPorts();
    dispatch(setSerialPorts(ports));
  };
}

/**
 * Attempts to connect to an output device and returns a promise that resolves
 * when the connection was successful.
 *
 * It is assumed that this action creator is invoked in response to a user
 * action and thus we can safely call `navigator.serial.requestPort()` from
 * the action.
 */
export async function tryConnectToOutputDevice({ serialPort, baudRate } = {}) {
  if (serialPort) {
    try {
      // Try to get hold of the SerialPort instance
      await window.bridge.requestAccessToSerialPortByName(serialPort);
      const nativePortObject = await navigator.serial.requestPort();
      await startHandlingSerialPort({
        serialPort,
        baudRate,
        nativePortObject,
      });
    } catch {
      console.error('Failed to connect to serial port');
    }
  } else {
    await stopHandlingSerialPort();
  }
}
