import isNil from 'lodash-es/isNil';

export function hasOutputDevice(state) {
  return !isNil(state.output.device);
}
