'use strict';

// Returns whether we are in production mode
const isProduction =
  process.env.NODE_ENV === 'production' || process.env.DEPLOYMENT === '1';

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
  logErrorToConsole,
  usingWebpackDevServer,
};
