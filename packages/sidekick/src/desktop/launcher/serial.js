// Current list of serial ports known to the application. Can be updated
// from setSerialPorts() when Electron's serial API provides us with a list
// of ports
const serialPorts = [];

const getSerialPorts = () => {
  return serialPorts.concat();
};

const setSerialPorts = (portList) => {
  serialPorts.length = 0;
  serialPorts.push(...portList);
};

const onSelectSerialPort = (event, portList, _webContents, callback) => {
  event.preventDefault();
  setSerialPorts(portList);
  callback('');
};

/**
 * Registers serial port related event handlers on an Electron session object.
 */
const registerSerialPortHandlers = (session) => {
  // Add a select-serial-port callback that stores the list of serial ports
  // so the renderers can request it from the main process with an IPC call
  session.on('select-serial-port', onSelectSerialPort);

  // TODO(ntamas): add support for serial-port-added and serial-port-removed;
  // they do not seem to fire on macOS yet
};

module.exports = {
  getSerialPorts,
  registerSerialPortHandlers,
  setSerialPorts,
};
