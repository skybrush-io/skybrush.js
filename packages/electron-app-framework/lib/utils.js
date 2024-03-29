// Do NOT import the process module; DefinePlugin from Webpack does not
// replace process.env.NODE_ENV and process.env.DEPLOYMENT during bundling
// if 'process' is imported; it must be a free global

/* eslint-disable n/prefer-global/process */

// Returns whether we are in production mode
const isProduction =
  process.env.NODE_ENV === 'production' || process.env.DEPLOYMENT === '1';

// Returns whether the app is running on macOS
const isRunningOnMac =
  typeof navigator !== 'undefined'
    ? navigator.platform.includes('Mac')
    : typeof process !== 'undefined'
    ? process.platform === 'darwin'
    : false;

// Decide whether we will connect to the Webpack dev server in development
// mode or not
const usingWebpackDevServer =
  process.env.NODE_ENV !== 'production' && process.env.DEPLOYMENT !== '1';

/**
 * Default function that decides whether a URL is trusted even in case of a
 * certificate error.
 */
function defaultUnsafeUrlHandler(url) {
  return usingWebpackDevServer && url.match(/^(https|wss):\/\/localhost:.*\//);
}

/**
 * Error handler function that logs the stack trace of an error to the console.
 */
function logErrorToConsole(error) {
  console.error(error.stack);
}

module.exports = {
  defaultUnsafeUrlHandler,
  isProduction,
  isRunningOnMac,
  logErrorToConsole,
  usingWebpackDevServer,
};

/* eslint-enable n/prefer-global/process */
