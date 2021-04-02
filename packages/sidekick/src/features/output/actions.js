import { showOutputDeviceDialog } from '~/features/ui/slice';

import { setSerialPorts } from './slice';

/**
 * Action creator that requests the list of serial ports from Electron and
 * _then_ opens the "output devices" dialog.
 */
export function requestSerialPortsAndShowOutputDeviceDialog() {
  return async (dispatch) => {
    const ports = await window.bridge.getSerialPorts();
    dispatch(setSerialPorts(ports));
    dispatch(showOutputDeviceDialog());
  };
}
