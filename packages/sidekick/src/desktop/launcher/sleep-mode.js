const { powerSaveBlocker } = require('electron');

function preventDisplaySleep() {
  return powerSaveBlocker.start('prevent-display-sleep');
}

function restoreDisplaySleep(token) {
  powerSaveBlocker.stop(token);
}

module.exports = {
  preventDisplaySleep,
  restoreDisplaySleep,
};
