const { setupApp, setupCli } = require('@skybrush/electron-app-framework');

/**
 * Main entry point of the application.
 *
 * @param  {Object}  argv  the parsed command line arguments
 */
function run(argv) {
  setupApp({
    mainWindow: {
      debug: argv.debug,
      rootDir: __dirname,
      size: [360, 480],
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        backgroundThrottling: false, // to keep RC packets flowing when the app is not in focus
      },
    },
  });
}

module.exports = (argv) => {
  const parser = setupCli();
  parser.parse(argv || process.argv);
  run(parser.opts());
};
