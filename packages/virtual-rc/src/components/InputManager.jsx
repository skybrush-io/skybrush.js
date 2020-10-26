import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';
import { useGamepads } from 'react-gamepads';

const GamepadInputManager = ({ index, onStateChanged }) => {
  // Pre-allocate an array to ease the strain on the GC -- this way we can avoid
  // an allocation in the onGamepadstateChanged handler, which gets called at
  // 60 fps
  const buttonArrayRef = useRef([]);
  const onGamepadStateChanged = useCallback(
    (gamepads) => {
      // This function constantly gets called in Chrome with the current version
      // of react-gamepads, so we can simply update the RC channels from here
      const gamepad = gamepads[index];
      if (gamepad && gamepad.connected && onStateChanged) {
        const buttonArray = buttonArrayRef.current;
        const numberButtons = gamepad.buttons.length;

        buttonArray.length = numberButtons;
        for (let i = 0; i < numberButtons; i++) {
          buttonArray[i] = gamepad.buttons[i].value;
        }

        onStateChanged(buttonArray, gamepad.axes);
      }
    },
    [index, onStateChanged]
  );

  useGamepads(onGamepadStateChanged);

  return null;
};

/**
 * Function that returns an appropriate React element for the specification of
 * an input device.
 */
const componentForInputDevice = (type, parameters, onStateChanged) => {
  switch (type) {
    case 'gamepad':
      return (
        <GamepadInputManager {...parameters} onStateChanged={onStateChanged} />
      );

    case 'keyboard':
      // TODO(ntamas)
      return null;

    default:
      console.warn(`Unknown input device type: ${type}`);
      return null;
  }
};

/**
 * React component that processes events from input devices and updates the
 * RC channel values accordingly.
 */
const InputManager = ({ inputs, onStateChanged }) =>
  (inputs || []).map(({ id, type, parameters }) => {
    const element = componentForInputDevice(type, parameters, onStateChanged);
    return element ? React.cloneElement(element, { key: id }) : element;
  });

InputManager.propTypes = {
  inputs: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      parameters: PropTypes.object,
    })
  ),
  onStateChanged: PropTypes.func,
};

export default InputManager;
