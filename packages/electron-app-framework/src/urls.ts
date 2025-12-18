import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { usingWebpackDevServer } from './utils';

export function getDefaultMainWindowUrlFromRootDir(
  rootDir: string,
  indexPage = 'index.html'
): string {
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

export function getDefaultPreloadUrlFromRootDir(rootDir: string): string {
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

export function getUrlsFromRootDir(rootDir: string): {
  url: string;
  preload: string;
} {
  return {
    url: getDefaultMainWindowUrlFromRootDir(rootDir),
    preload: getDefaultPreloadUrlFromRootDir(rootDir),
  };
}
