const { setupApp, setupCli } = require('@skybrush/electron-app-framework');
const ElectronStore = require('electron-store');

/**
 * Main entry point of the application.
 *
 * @param  {Object}  argv  the parsed command line arguments
 */
function run(argv) {
  // Allow the Electron state store to be created in the renderer process
  ElectronStore.initRenderer();

  setupApp({
    mainWindow: {
      debug: argv.debug,
      rootDir: __dirname,
      size: [1024, 768],
      webPreferences: {
        backgroundThrottling: false, // to keep radio packets flowing when the app is not in focus
      },
    },
  });
}

module.exports = (argv) => {
  const parser = setupCli();
  parser.parse(argv || process.argv);
  run(parser.opts());
};
