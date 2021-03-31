const {
  setupApp,
  setupCli,
  createMainWindowFactory,
} = require('@skybrush/electron-app-framework');
const ElectronStore = require('electron-store');

const setupIpc = require('./ipc');
const { registerSerialPortHandlers } = require('./serial');

/**
 * Main entry point of the application.
 *
 * @param  {Object}  argv  the parsed command line arguments
 */
function run(argv) {
  // Allow the Electron state store to be created in the renderer process
  ElectronStore.initRenderer();

  // Create a main window factory function
  const mainWindowFactory = createMainWindowFactory({
    debug: argv.debug,
    rootDir: __dirname,
    size: [1024, 768],
    webPreferences: {
      backgroundThrottling: false, // to keep radio packets flowing when the app is not in focus
      enableBlinkFeatures: 'Serial',
    },
  });

  setupApp({
    mainWindow: (app) => {
      const window = mainWindowFactory(app);
      const { session } = window.webContents;
      registerSerialPortHandlers(session);
      return window;
    },
  });

  // Set up IPC handlers
  setupIpc();
}

module.exports = () => {
  const parser = setupCli();
  parser.parse();
  run(parser.opts());
};
