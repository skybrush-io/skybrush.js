import isNil from 'lodash-es/isNil';

const TRANSIENT_STATES = new Set(['connecting', 'disconnecting']);

export function describeOutputDevice(state) {
  if (!hasOutputDevice(state)) {
    return null;
  }

  const { serialPort, type } = state.output.device;
  switch (type) {
    case 'serial':
      return serialPort;

    default:
      return 'Unknown output device';
  }
}

export function getDetectedSerialPortList(state) {
  const ports = state.output.serialPorts;
  return Array.isArray(ports) ? ports : [];
}

export function getConnectionState(state) {
  return state.output.connectionState || 'disconnected';
}

export function hasOutputDevice(state) {
  return !isNil(state.output.device);
}

export function hasConnectedOutputDevice(state) {
  return hasOutputDevice(state) && getConnectionState(state) === 'connected';
}

export function isConnectionInTransientState(state) {
  return TRANSIENT_STATES.has(getConnectionState(state));
}
