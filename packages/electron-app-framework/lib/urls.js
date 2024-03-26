'use strict';

/* eslint-disable unicorn/prefer-node-protocol */
const fs = require('fs');
const url = require('url');
const path = require('path');
/* eslint-enable unicorn/prefer-node-protocol */

const { usingWebpackDevServer } = require('./utils');

function getDefaultMainWindowUrlFromRootDir(rootDir, indexPage = 'index.html') {
  if (usingWebpackDevServer) {
    /* Load from webpack-dev-server */
    return `https://localhost:8080/${indexPage}`;
  }

  if (!rootDir) {
    throw new Error('rootDir must be set to the folder containing index.html');
  }

  let index = path.join(rootDir, indexPage);
  if (!fs.existsSync(index)) {
    index = path.join(rootDir, '..', indexPage);
  }

  return url.format({
    pathname: index,
    protocol: 'file:',
    slashes: true,
  });
}

function getDefaultPreloadUrlFromRootDir(rootDir) {
  const candidates = usingWebpackDevServer
    ? ['../preload/index.mjs', '../preload/index.js']
    : ['preload.bundle.js'];

  for (const candidate of candidates) {
    const fullPath = path.join(rootDir, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return path.join(rootDir, candidates[candidates.length - 1]);
}

function getUrlsFromRootDir(rootDir) {
  return {
    url: getDefaultMainWindowUrlFromRootDir(rootDir),
    preload: getDefaultPreloadUrlFromRootDir(rootDir),
  };
}

module.exports = {
  getDefaultMainWindowUrlFromRootDir,
  getDefaultPreloadUrlFromRootDir,
  getUrlsFromRootDir,
};
