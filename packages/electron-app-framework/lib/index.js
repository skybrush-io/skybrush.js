'use strict';

const setupApp = require('./app');
const setupCli = require('./cli');
const createMainWindowFactory = require('./main-window');
const {
  defaultUnsafeUrlHandler,
  isProduction,
  isRunningOnMac,
  usingWebpackDevServer,
} = require('./utils');

module.exports = {
  createMainWindowFactory,
  defaultUnsafeUrlHandler,
  isProduction,
  isRunningOnMac,
  setupApp,
  setupCli,
  usingWebpackDevServer,
};
