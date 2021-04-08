import { isNil } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { HotKeys } from 'react-hotkeys';
import { connect } from 'react-redux';

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
import { setSelectedUAVId } from './features/ui/slice';

// TODO(ntamas): currently if I am pressing numbers fast enough that the
// keydown events overlap, HotKeys tries to match them to a key combination
// and fails to trigger the appropriate handler for the second keypress

const keyMap = {
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
  SELECT_PENDING_UAV: 'enter',
  MOVE_CARET_LEFT: 'left',
  MOVE_CARET_RIGHT: 'right',
  MOVE_CARET_UP: 'up',
  MOVE_CARET_DOWN: 'down',
  MOVE_END: 'end',
  MOVE_HOME: 'home',
};

const AppHotkeys = ({
  appendDigit,
  clearDigits,
  deleteLastDigit,
  selectPendingUAV,
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
  }
)(AppHotkeys);
