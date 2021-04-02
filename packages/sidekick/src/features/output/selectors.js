import isNil from 'lodash-es/isNil';

export function getDetectedSerialPortList(state) {
  const ports = state.output.serialPorts;
  return Array.isArray(ports) ? ports : [];
}

export function hasOutputDevice(state) {
  return !isNil(state.output.device);
}
