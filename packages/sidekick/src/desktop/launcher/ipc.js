const { ipcMain } = require('electron');
const { ipcMain: ipc } = require('electron-better-ipc');

const {
  getSerialPorts,
  notifyRequestingAccessToSerialPortByName,
} = require('./serial');
const { preventDisplaySleep, restoreDisplaySleep } = require('./sleep-mode');

module.exports = () => {
  // HACK for https://github.com/sindresorhus/electron-better-ipc/issues/35
  ipcMain.addListener(
    'fix-event-798e09ad-0ec6-5877-a214-d552934468ff',
    () => {}
  );

  // Normal electron-better-ipc code comes here
  ipc.answerRenderer('getSerialPorts', getSerialPorts);
  ipc.answerRenderer(
    'notifyRequestingAccessToSerialPortByName',
    notifyRequestingAccessToSerialPortByName
  );
  ipc.answerRenderer('preventDisplaySleep', preventDisplaySleep);
  ipc.answerRenderer('restoreDisplaySleep', restoreDisplaySleep);
};
