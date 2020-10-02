'use strict';

const { program } = require('commander');
const { app } = require('electron');

/**
 * Generic setup function for command line parsers of Electron applications
 * that sets up some common command line options that we use across the
 * Skybrush suite.
 */
function setupCli(parser = program) {
  parser
    .storeOptionsAsProperties(false)
    .name(app.getName())
    .version(app.getVersion())
    .description(`Launches ${app.getName()} in a desktop window`)
    .option('-d, --debug', 'Start in debug mode with the developer tools open');
  return parser;
}

module.exports = setupCli;
