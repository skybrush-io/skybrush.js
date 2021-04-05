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
  } catch {
    // This is okay; we did not want to select a serial port explicitly so
    // the main process makes the call above throw an exception, which we
    // now ignore
  }

  const result = await ipc.callMain('getSerialPorts');
  return result;
}

/**
 * Requests the main process to provide access to a serial port, given its name.
 * The port can then be retrieved by calling `navigator.serial.requestPort()`
 * from the renderer process.
 *
 * Note that we cannot call `navigator.serial.requestPort()` here because of
 * context isolation; serial ports cannot be passed between isolated contexts.
 */
async function requestAccessToSerialPortByName(name) {
  await ipc.callMain('notifyRequestingAccessToSerialPortByName', name);
}

// Inject the bridge functions between the main and the renderer processes.
// These are the only functions that the renderer processes may call to access
// any functionality that requires Node.js -- they are not allowed to use
// Node.js modules themselves
contextBridge.exposeInMainWorld('bridge', {
  createStateStore,
  getSerialPorts,
  requestAccessToSerialPortByName,
});

// Set up IPC handlers
setupIpc();
