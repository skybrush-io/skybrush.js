'use strict';

const { app, Menu, shell } = require('electron');
const unhandled = require('electron-unhandled');

// eslint-disable-next-line unicorn/prefer-node-protocol
const process = require('process');

const createMainWindowFactory = require('./main-window');
const { defaultUnsafeUrlHandler, logErrorToConsole } = require('./utils');

/**
 * Generic setup function for Electron applications that sets up sane defaults
 * that are suitable for most of the Skybrush suite.
 *
 * @param  appMenu  the application menu instance or a function that creates the
 *         application menu when called with no arguments
 * @param  enableNavigation  whether to enable in-app navigation to URLs that
 *         point outside the application. The default is to open external URLs
 *         in a browser
 * @param  lastWindowClosesApp  whether to close the application when the last
 *         window is closed. When omitted, defaults to false on macOS and true
 *         on all other platforms
 * @param  mainWindow  a function that creates the main window of the application
 *         when invoked with no arguments, and takes care of not creating multiple
 *         windows when the main window is already open. Typically you should
 *         create such a function with `createMainWindowFactory()`. It can also
 *         be an object; in this case, the object is passed to
 *         `createMainWindowFactory()` and the returned factory function will
 *         be used.
 * @param  unhandledErrorLogger  a function that gets called with any unhandled
 *         errors that are caught by the Electron framework. The default
 *         implementation logs the exception on the console.
 */
function setupApp({
  appMenu,
  enableNavigation = false,
  isUnsafeUrlTrusted = defaultUnsafeUrlHandler,
  lastWindowClosesApp,
  mainWindow,
  subWindowMenuBar = true,
  unhandledErrorLogger = logErrorToConsole,
} = {}) {
  // Register unhandled error handler
  unhandled({
    logger: unhandledErrorLogger,
  });

  // Validate type of mainWindow
  if (typeof mainWindow !== 'function') {
    mainWindow = createMainWindowFactory(mainWindow);
  }

  // Create main window factory
  const mainWindowCreator = () => mainWindow(app);

  // Register application menu at startup
  if (appMenu) {
    app.on('ready', () => {
      if (typeof appMenu === 'function') {
        appMenu = appMenu();
      }

      Menu.setApplicationMenu(appMenu);
    });
  }

  // Handle certificate errors
  app.on(
    'certificate-error',
    // eslint-disable-next-line max-params
    (event, _webContents, url, _error, _cert, callback) => {
      if (isUnsafeUrlTrusted(url)) {
        event.preventDefault();
        callback(true);
      } else {
        console.warn(
          'Prevented connection to URL due to certificate error:',
          url
        );
        callback(false);
      }
    }
  );

  // Prevent the creation of additional windows or web views. Also prevent
  // navigation.
  app.on('web-contents-created', (_event, webContents) => {
    const allowedPrefixes = [
      'file://',
      'http://localhost',
      'https://localhost',
      'about:blank',
    ];
    const isUrlAllowedForNavigation = (url) =>
      typeof url === 'string' &&
      allowedPrefixes.some((prefix) => url.startsWith(prefix));

    webContents.on(
      'will-attach-webview',
      (event, webPreferences, parameters) => {
        // Disable Node.js integration
        webPreferences.nodeIntegration = false;

        webPreferences.spellcheck = false;
        webPreferences.worldSafeExecuteJavaScript = true;

        if (!enableNavigation && !isUrlAllowedForNavigation(parameters.src)) {
          // Prevent creating web views that point outside
          event.preventDefault();
        }
      }
    );

    if (!enableNavigation) {
      webContents.on('will-navigate', async (event, navigationUrl) => {
        if (!isUrlAllowedForNavigation(navigationUrl)) {
          event.preventDefault();
          await shell.openExternal(navigationUrl);
        }
      });

      webContents.setWindowOpenHandler(({ url }) => {
        if (!isUrlAllowedForNavigation(url)) {
          // TODO: This breaks structured concurrency, but setWindowOpenHandler
          // does not support callbacks that have a promise as return value...
          shell.openExternal(url);
          return { action: 'deny' };
        }

        return { action: 'allow' };
      });
    }

    if (subWindowMenuBar === false) {
      webContents.on('did-create-window', (win) => {
        win.removeMenu();
      });
    }
  });

  // Create the main window when the application is ready
  app.on('ready', () => {
    mainWindowCreator();
  });

  // Quit when all windows are closed -- unless we are on a Mac and we have not
  // explicitly asked the framework to close the app when the last window closes
  lastWindowClosesApp = lastWindowClosesApp || process.platform !== 'darwin';

  // Close the app when all windows are closed. Note that we need the event
  // handler to prevent the default behaviour, which would close the app even
  // on macOS, so we can't put the condition outside the event handler
  // registration.
  app.on('window-all-closed', () => {
    if (lastWindowClosesApp) {
      app.quit();
    }
  });

  if (!lastWindowClosesApp) {
    // Re-create the main window on a Mac when the user clicks on the Dock
    // icon, unless we already have a main window
    app.on('activate', mainWindowCreator);
  }
}

module.exports = setupApp;
