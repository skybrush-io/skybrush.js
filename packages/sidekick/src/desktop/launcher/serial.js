// Current list of serial ports known to the application. Can be updated
// from setSerialPorts() when Electron's serial API provides us with a list
// of ports
const serialPorts = [];

// Variable that stores the name of the serial port that the next call to
// `navigator.serial.requestPort()` from the renderer process is about to
// request.
let nextSerialPortRequest = null;

/**
 * Notifies the main process that a renderer process is about to request access
 * to a serial port by its name. The next call to `navigator.serial.requestPort()`
 * in the renderer process will resolve with the corresponding port object if
 * such a port exists.
 */
const notifyRequestingAccessToSerialPortByName = (name) => {
  nextSerialPortRequest = name;
};

/**
 * Returns a list of currently known serial port objects.
 */
const getSerialPorts = () => {
  return serialPorts.concat();
};

/**
 * Sets the list of currently known serial port objects.
 */
const setSerialPorts = (portList) => {
  serialPorts.length = 0;
  serialPorts.push(...portList);
};

/**
 * Event handler called when Electron provides us with the list of known
 * serial ports in response to a 'select-serial-port' event.
 */
const onSelectSerialPort = (event, portList, _webContents, callback) => {
  let result = '';

  if (nextSerialPortRequest) {
    // User wants us to select a serial port given its name, so let's look for
    // one with exactly the given name
    const port = portList.find((p) => p.portName === nextSerialPortRequest);
    if (port) {
      result = port.portId;
    }

    nextSerialPortRequest = null;
  }

  event.preventDefault();

  setSerialPorts(portList);
  callback(result);
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
  notifyRequestingAccessToSerialPortByName,
  registerSerialPortHandlers,
  setSerialPorts,
};
