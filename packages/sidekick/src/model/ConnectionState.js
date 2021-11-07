import { Colors } from '@skybrush/app-theme-mui';

const ConnectionState = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTING: 'disconnecting',
  DISCONNECTED: 'disconnected',

  ALL: Object.freeze([
    'connecting',
    'connected',
    'disconnecting',
    'disconnected',
  ]),

  TRANSIENT: Object.freeze(['connecting', 'disconnecting']),
};

ConnectionState.isTransient = (state) =>
  ConnectionState.TRANSIENT.includes(state);
ConnectionState.isValid = (state) => ConnectionState.ALL.includes(state);

ConnectionState.toColor = (state) => {
  switch (state) {
    case ConnectionState.CONNECTED:
      return Colors.success;

    case ConnectionState.CONNECTING:
    case ConnectionState.DISCONNECTING:
      return Colors.warning;

    case ConnectionState.DISCONNECTED:
      return Colors.error;

    default:
      return Colors.missing;
  }
};

export default ConnectionState;
