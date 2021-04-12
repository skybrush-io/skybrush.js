import ConnectionState from '~/model/ConnectionState';

export function getServerConnectionState(state) {
  return state.input.server.connectionState || ConnectionState.DISCONNECTED;
}

export function isServerConnectionActive(state) {
  return Boolean(state.input.server.active);
}

export function isServerConnectionInTransientState(state) {
  return ConnectionState.isTransient(getServerConnectionState(state));
}
