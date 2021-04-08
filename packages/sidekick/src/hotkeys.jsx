import isNil from 'lodash-es/isNil';
import PropTypes from 'prop-types';
import React from 'react';
import { configure as configureHotkeys, HotKeys } from 'react-hotkeys';
import { connect } from 'react-redux';

import {
  disarm,
  flashLights,
  land,
  returnToHome,
  switchToPositionHold,
  switchToShowMode,
} from '~/features/flight/actions';
import {
  appendDigitToPendingUAVId,
  clearPendingUAVId,
  deleteLastPendingDigitOfUAVId,
} from '~/features/keyboard/actions';
import {
  getPendingUAVId,
  hasPendingUAVId,
} from '~/features/keyboard/selectors';
import { clearSelectedUAVId } from '~/features/ui/actions';
import { setSelectedUAVId } from '~/features/ui/slice';

configureHotkeys({
  // This is necessary to ensure that the appropriate handlers are triggered
  // when digit keys are pressed in rapid succession; otherwise it can happen
  // that the keydown event of the second key is triggered before the keyup
  // event of the first key, and react-hotkeys would then be evaluating the
  // key combination only
  allowCombinationSubmatches: true,
});

// Create the default keymap mapping keys to actions
export const keyMap = {
  APPEND_DIGIT_0: '0',
  APPEND_DIGIT_1: '1',
  APPEND_DIGIT_2: '2',
  APPEND_DIGIT_3: '3',
  APPEND_DIGIT_4: '4',
  APPEND_DIGIT_5: '5',
  APPEND_DIGIT_6: '6',
  APPEND_DIGIT_7: '7',
  APPEND_DIGIT_8: '8',
  APPEND_DIGIT_9: '9',

  CLEAR_SELECTION: 'escape',
  DELETE_LAST_DIGIT: 'backspace',

  MOVE_CARET_LEFT: 'left',
  MOVE_CARET_RIGHT: 'right',
  MOVE_CARET_UP: 'up',
  MOVE_CARET_DOWN: 'down',
  MOVE_END: 'end',
  MOVE_HOME: 'home',

  SELECT_PENDING_UAV: 'enter',
  TRIGGER_LANDING: 'l',
  TRIGGER_POSITION_HOLD: 'p',
  TRIGGER_RETURN_TO_HOME: 'r',
  TRIGGER_SHOW_MODE: 's',
  FLASH_LIGHTS: 'w',
  TRIGGER_DISARM: 'shift+x',
};

// Helper function that creates a Redux thunk that selects the pending UAV _and_
// triggers another action
const createKeyboardHandlerForAction = (action) => (...args) => (
  dispatch,
  getState
) => {
  const uavId = getPendingUAVId(getState());
  if (!isNil(uavId)) {
    dispatch(clearPendingUAVId());
    dispatch(setSelectedUAVId(uavId));
  }

  dispatch(action(...args));
};

const AppHotkeys = ({
  appendDigit,
  clearDigits,
  deleteLastDigit,
  selectPendingUAV,
  triggerDisarm,
  triggerLanding,
  triggerLightSignal,
  triggerPositionHold,
  triggerShowMode,
  triggerReturnToHome,

  children,
}) => {
  const handlers = {
    APPEND_DIGIT_0: () => appendDigit(0),
    APPEND_DIGIT_1: () => appendDigit(1),
    APPEND_DIGIT_2: () => appendDigit(2),
    APPEND_DIGIT_3: () => appendDigit(3),
    APPEND_DIGIT_4: () => appendDigit(4),
    APPEND_DIGIT_5: () => appendDigit(5),
    APPEND_DIGIT_6: () => appendDigit(6),
    APPEND_DIGIT_7: () => appendDigit(7),
    APPEND_DIGIT_8: () => appendDigit(8),
    APPEND_DIGIT_9: () => appendDigit(9),
    CLEAR_SELECTION: clearDigits,
    DELETE_LAST_DIGIT: deleteLastDigit,
    TRIGGER_DISARM: triggerDisarm,
    TRIGGER_LANDING: triggerLanding,
    FLASH_LIGHTS: triggerLightSignal,
    TRIGGER_POSITION_HOLD: triggerPositionHold,
    TRIGGER_RETURN_TO_HOME: triggerReturnToHome,
    TRIGGER_SHOW_MODE: triggerShowMode,
    SELECT_PENDING_UAV: selectPendingUAV,
  };

  return (
    <HotKeys root keyMap={keyMap} handlers={handlers}>
      {children}
    </HotKeys>
  );
};

AppHotkeys.propTypes = {
  appendDigit: PropTypes.func,
  clearDigits: PropTypes.func,
  deleteLastDigit: PropTypes.func,
  selectPendingUAV: PropTypes.func,
  triggerDisarm: PropTypes.func,
  triggerLanding: PropTypes.func,
  triggerLightSignal: PropTypes.func,
  triggerPositionHold: PropTypes.func,
  triggerReturnToHome: PropTypes.func,
  triggerShowMode: PropTypes.func,

  children: PropTypes.node,
};

export default connect(
  // mapStateToProps
  () => ({}),
  // mapDispatchToProps
  {
    appendDigit: appendDigitToPendingUAVId,

    clearDigits: () => (dispatch, getState) => {
      if (hasPendingUAVId(getState())) {
        dispatch(clearPendingUAVId());
      } else {
        dispatch(clearSelectedUAVId());
      }
    },

    deleteLastDigit: deleteLastPendingDigitOfUAVId,

    selectPendingUAV: (event) => {
      // Prevent the default behaviour so Material-UI does not trigger the
      // first button of the main window when we press Enter
      event.preventDefault();
      event.stopPropagation();

      return (dispatch, getState) => {
        const uavId = getPendingUAVId(getState());
        if (!isNil(uavId)) {
          dispatch(clearPendingUAVId());
          dispatch(setSelectedUAVId(uavId));
        }
      };
    },

    triggerDisarm: createKeyboardHandlerForAction(disarm),
    triggerLanding: createKeyboardHandlerForAction(land),
    triggerLightSignal: createKeyboardHandlerForAction(flashLights),
    triggerPositionHold: createKeyboardHandlerForAction(switchToPositionHold),
    triggerReturnToHome: createKeyboardHandlerForAction(returnToHome),
    triggerShowMode: createKeyboardHandlerForAction(switchToShowMode),
  }
)(AppHotkeys);
