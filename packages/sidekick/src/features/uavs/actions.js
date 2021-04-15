import isNil from 'lodash-es/isNil';

export function updateDroneErrorCodes(offset, updates) {
  return () => {
    for (const [index, errorCode] of updates.entries()) {
      const uavId = index + offset;
      if (isNil(errorCode)) {
        console.log(uavId, 'went inactive');
      } else if (errorCode === 0) {
        console.log(uavId, 'is now online');
      } else {
        console.log(uavId, 'has error', errorCode);
      }
    }

    /* TODO(ntamas): any drones that are outside the range covered by 'updates'
     * are now disconnected */
  };
}
