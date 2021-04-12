import { isServerConnectionActive } from './selectors';
import { connectToServer, disconnectFromServer } from './slice';

export function setServerConnectionActive(active) {
  return active ? connectToServer() : disconnectFromServer();
}

export function toggleServerConnection() {
  return (dispatch, getState) => {
    const isActive = isServerConnectionActive(getState());
    dispatch(setServerConnectionActive(!isActive));
  };
}
