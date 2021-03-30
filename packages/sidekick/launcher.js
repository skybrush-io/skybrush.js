const { app } = require('electron');

// Enable the serial port chooser window
app.commandLine.appendSwitch('enable-features', 'ElectronSerialChooser');

const main = require('./src/desktop/launcher');
main();
