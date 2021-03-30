const { contextBridge } = require('electron');
const { ipcRenderer: ipc } = require('electron-better-ipc');
const unhandled = require('electron-unhandled');
const createStorageEngine = require('redux-persist-electron-storage');

const setupIpc = require('./ipc');

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

/**
 * Returns the list of serial ports currently known to the main process.
 */
async function getSerialPorts() {
  try {
    await navigator.serial.requestPort();
  } catch {}

  const result = await ipc.callMain('getSerialPorts');
  return result;
}

// Inject the bridge functions between the main and the renderer processes.
// These are the only functions that the renderer processes may call to access
// any functionality that requires Node.js -- they are not allowed to use
// Node.js modules themselves
contextBridge.exposeInMainWorld('bridge', {
  createStateStore,
  getSerialPorts,
});

// Set up IPC handlers
setupIpc();
