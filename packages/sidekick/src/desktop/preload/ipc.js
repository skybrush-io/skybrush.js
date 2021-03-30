const { ipcRenderer } = require('electron');

module.exports = () => {
  // HACK for https://github.com/sindresorhus/electron-better-ipc/issues/35
  ipcRenderer.addListener(
    'fix-event-79558e00-29ef-5c7f-84bd-0bcd9a0c5cf3',
    () => {}
  );

  // Normal electron-better-ipc code comes here
};
