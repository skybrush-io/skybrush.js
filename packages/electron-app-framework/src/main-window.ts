import {
  BrowserWindow,
  type App,
  type BrowserWindowConstructorOptions,
} from 'electron';
import windowStateKeeper from 'electron-window-state';

import { getUrlsFromRootDir } from './urls.js';

type MainWindowOptions = {
  backgroundColor?: string;
  debug?: boolean;
  rootDir?: string | (() => { url: string; preload: string });
  showMenuBar?: boolean;
  size?: [number, number];
} & BrowserWindowConstructorOptions;

/**
 * Creates a factory function that creates the main window of the application
 * when invoked with the Electron app as its only argument.
 *
 * Prevents the creation of multiple main windows; if a main window exists
 * already, it will return the existing main window instance.
 *
 * Any options argument not explicitly mentioned here are forwarded to the
 * BrowserWindow constructor.
 *
 * @param  app  the main Electron application object
 * @param  backgroundColor  background color of the main window.
 *         This needs to be set for nicer font antialiasing; the default is white.
 * @param  debug  whether to start with the developer tools open
 * @param  showMenuBar    whether the application will have a menu bar
 * @param  rootDir  the directory containing index.html
 *         and preload.bundle.js (typically derived from __dirname), or a
 *         function that can be called with no arguments and that returns the
 *         full path to index.html and to the preloader, as an object with two
 *         keys: 'url' and 'preload'
 * @param  size  default size of the main window
 * @return the main window of the application that was created
 */
export const createMainWindowFactory = ({
  backgroundColor = '#ffffff',
  debug,
  rootDir,
  showMenuBar = true,
  size = [1024, 768],
  webPreferences,
  ...rest
}: MainWindowOptions = {}): ((app: App) => BrowserWindow) => {
  let instance: BrowserWindow | undefined;
  let windowState: windowStateKeeper.State;

  if (rootDir === undefined) {
    throw new TypeError('rootDir must be specified');
  }

  const { url, preload } =
    typeof rootDir === 'string' ? getUrlsFromRootDir(rootDir) : rootDir();

  if (preload) {
    webPreferences = {
      ...webPreferences,
      preload,
    };
  }

  return (app: App) => {
    if (instance !== undefined) {
      return instance;
    }

    if (!windowState) {
      windowState = windowStateKeeper({
        defaultWidth: size[0],
        defaultHeight: size[1],
        fullScreen: false,
      });
    }

    const { x, y, width, height } = windowState;
    instance = new BrowserWindow({
      title: app.name,
      show: false,
      backgroundColor,
      x,
      y,
      width,
      height,
      ...rest,
      webPreferences: {
        contextIsolation: true,
        ...webPreferences,
      },
    });

    if (!showMenuBar) {
      instance.removeMenu();
    }

    windowState.manage(instance);

    instance.on('closed', () => {
      windowState.unmanage();
      instance = undefined;
    });

    instance.on('ready-to-show', () => {
      if (!instance) {
        return;
      }

      instance.show();
      instance.focus();

      if (debug) {
        instance.webContents.openDevTools({
          mode: 'undocked',
        });
      }
    });

    if (url) {
      void instance.loadURL(url);
    }

    return instance;
  };
};

export default createMainWindowFactory;
