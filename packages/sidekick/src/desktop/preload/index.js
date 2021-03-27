const { contextBridge } = require('electron');
const unhandled = require('electron-unhandled');
const createStorageEngine = require('redux-persist-electron-storage');

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

// Inject the bridge functions between the main and the renderer processes.
// These are the only functions that the renderer processes may call to access
// any functionality that requires Node.js -- they are not allowed to use
// Node.js modules themselves
contextBridge.exposeInMainWorld(
  'bridge',
  {
    createStateStore,
  }
);

