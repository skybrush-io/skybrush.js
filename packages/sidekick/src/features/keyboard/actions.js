import { MAVLINK_NETWORK_SIZE } from '~/ardupilot';

import { setPendingUAVId, startPendingUAVIdTimeout } from './slice';

const isValidDigit = (digit) =>
  typeof digit === 'number' &&
  digit >= 0 &&
  digit <= 9 &&
  Number.isInteger(digit);

export function appendDigitToPendingUAVId(digit) {
  return (dispatch, getState) => {
    if (isValidDigit(digit)) {
      const pendingUAVId = getState().keyboard.pendingUAVId;

      let newUAVId = pendingUAVId * 10 + digit;
      while (newUAVId >= MAVLINK_NETWORK_SIZE) {
        newUAVId =
          newUAVId >= 10 ? Number.parseInt(String(newUAVId).slice(1), 10) : 0;
      }

      dispatch(setPendingUAVId(newUAVId));
      dispatch(startPendingUAVIdTimeout());
    }
  };
}

export function clearPendingUAVId() {
  return setPendingUAVId(0);
}

export function deleteLastPendingDigitOfUAVId() {
  return (dispatch, getState) => {
    const pendingUAVId = getState().keyboard.pendingUAVId;
    if (pendingUAVId > 0) {
      dispatch(setPendingUAVId(Math.floor(pendingUAVId / 10)));
      dispatch(startPendingUAVIdTimeout());
    }
  };
}
