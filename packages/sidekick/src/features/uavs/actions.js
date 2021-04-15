import isNil from 'lodash-es/isNil';

import { MAVLINK_NETWORK_SIZE } from '~/ardupilot';

import { getUAVState } from './selectors';
import { applyUAVStateDiff } from './slice';

export function updateUAVErrorCodes(startUAVId, updates) {
  return (dispatch, getState) => {
    const diff = [];
    const uavStates = getUAVState(getState());
    const endUAVId = startUAVId + updates.length;

    for (const [index, errorCode] of updates.entries()) {
      const uavId = index + startUAVId;
      if (uavId >= MAVLINK_NETWORK_SIZE) {
        break;
      }

      if (isNil(errorCode)) {
        /* UAV became inactive */
        if (uavStates[uavId].active) {
          diff.push(uavId, { active: false });
        }
      } else if (
        !uavStates[uavId].active ||
        uavStates[uavId].errorCode !== errorCode
      ) {
        /* UAV is active and has an error code */
        diff.push(uavId, { active: true, errorCode });
      }
    }

    /* Any drones whose ID falls in the range [0; startUAVId) are to be
     * marked inactive if they are not inactive yet */
    for (let uavId = 0; uavId < startUAVId; uavId++) {
      if (uavStates[uavId].active) {
        diff.push(uavId, { active: false });
      }
    }

    /* Any drones whose ID falls in the range [endUAVId; MAVLINK_NETWORK_SIZE) are to be
     * marked inactive if they are not inactive yet */
    for (let uavId = endUAVId; uavId < MAVLINK_NETWORK_SIZE; uavId++) {
      if (uavStates[uavId].active) {
        diff.push(uavId, { active: false });
      }
    }

    if (diff.length > 0) {
      dispatch(applyUAVStateDiff(diff));
    }
  };
}
