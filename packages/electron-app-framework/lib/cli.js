'use strict';

const { program } = require('commander');
const { app } = require('electron');

/**
 * Generic setup function for command line parsers of Electron applications
 * that sets up some common command line options that we use across the
 * Skybrush suite.
 */
function setupCli(parser = program) {
  parser.storeOptionsAsProperties(false);

  if (app) {
    parser.name(app.getName());
    parser.version(app.getVersion());
    parser.description(`Launches ${app.getName()} in a desktop window`);
  }

  parser.option(
    '-d, --debug',
    'Start in debug mode with the developer tools open'
  );

  if (process.platform === 'darwin') {
    // Override .parse() method to strip macOS -psn_ arguments from argv
    const { parse } = parser;
    parser.parse = (argv, parseOptions = {}, ...rest) => {
      if (argv === undefined) {
        argv = process.argv;
        if (process.versions && process.versions.electron) {
          parseOptions.from = 'electron';
        }
      }

      argv = argv.filter(
        (arg) => typeof arg !== 'string' || !arg.startsWith('-psn_')
      );
      return parse.call(parser, argv, parseOptions, ...rest);
    };
  }

  return parser;
}

module.exports = setupCli;
