const { contextBridge } = require('electron');
const { ipcRenderer: ipc } = require('electron-better-ipc');
const createStorageEngine = require('redux-persist-electron-storage');

const setupIpc = require('./ipc');
const createServerConnection = require('./server');

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

/**
 * Requests the main process to prevent the display from going to sleep.
 *
 * Returns a token that can be used to restore the sleep mode. This token must
 * be passed to `restoreDisplaySleep()`.
 */
function preventDisplaySleep() {
  return ipc.callMain('preventDisplaySleep');
}

/**
 * Requests the main process to restore the normal display sleep mode.
 */
function restoreDisplaySleep(token) {
  return ipc.callMain('restoreDisplaySleep', token);
}

// Inject the bridge functions between the main and the renderer processes.
// These are the only functions that the renderer processes may call to access
// any functionality that requires Node.js -- they are not allowed to use
// Node.js modules themselves
contextBridge.exposeInMainWorld('bridge', {
  createServerConnection,
  createStateStore,
  getSerialPorts,
  preventDisplaySleep,
  requestAccessToSerialPortByName,
  restoreDisplaySleep,
});

// Set up IPC handlers
setupIpc();
