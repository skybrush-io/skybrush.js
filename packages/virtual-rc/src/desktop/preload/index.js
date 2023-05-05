const { contextBridge } = require('electron');
const createStorageEngine = require('redux-persist-electron-storage');

const createUdpOutput = require('./udp-output');

/**
 * Creates a Redux state store object that stores the Redux state in an
 * Electron store.
 *
 * @return {Object}  a Redux storage engine that can be used by redux-storage
 */
function createStateStore() {
  return createStorageEngine({
    store: {
      name: 'state',
    },
  });
}

const outputs = [createUdpOutput()];

/**
 * Sends the given RC channel values to all the configured outputs.
 */
function sendRCChannelValues(values) {
  for (const output of outputs) {
    output.send(values);
  }
}

// Inject the bridge functions between the main and the renderer processes.
// These are the only functions that the renderer processes may call to access
// any functionality that requires Node.js -- they are not allowed to use
// Node.js modules themselves
contextBridge.exposeInMainWorld('bridge', {
  createStateStore,
  sendRCChannelValues,
});