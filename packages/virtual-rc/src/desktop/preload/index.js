const unhandled = require('electron-unhandled');
const createStorageEngine = require('redux-persist-electron-storage');

const createUdpOutput = require('./udp-output');

unhandled({
  logger: (error) => console.error(error.stack),
});

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

// Inject isElectron into 'window' so we can easily detect that we are
// running inside Electron
window.isElectron = true;

// Inject the bridge functions between the main and the renderer processes.
// These are the only functions that the renderer processes may call to access
// any functionality that requires Node.js -- they are not allowed to use
// Node.js modules themselves
window.bridge = {
  createStateStore,
  sendRCChannelValues,
};
