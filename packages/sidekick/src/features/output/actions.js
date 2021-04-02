import { showOutputDeviceDialog } from '~/features/ui/slice';

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
 * Thunk action creator that attempts to connect to an output device
 */
export function tryConnectToOutputDevice({ serialPort, baudRate } = {}) {
  return (dispatch) => {
    console.log(serialPort);
    console.log(baudRate);
  };
}
