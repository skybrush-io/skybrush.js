import { delay, put } from 'redux-saga/effects';

import { updateRecencyScores } from './actions';
import { getCounterIfDirty } from './counters';
import { updateRTKStatistics } from './slice';

/**
 * Specifies how many times per second we are updating the statistics.
 */
const UPDATE_RATE = 1;

let updateRecenciesUntil = null;

function extendRecencyUpdates(numberOfSeconds = 15) {
  const deadline = performance.now() + numberOfSeconds * 1000;
  updateRecenciesUntil =
    updateRecenciesUntil === null
      ? deadline
      : Math.max(updateRecenciesUntil, deadline);
}

/**
 * Synchronizes the counters to the appropriate parts of the state store.
 */
function* syncCountersToStore() {
  const rtkCounter = getCounterIfDirty('rtk');

  if (rtkCounter) {
    yield put(
      updateRTKStatistics({
        packetsSent: rtkCounter.packets,
        bytesSent: rtkCounter.bytes,
        timestamp: rtkCounter.timestamp,
      })
    );
    extendRecencyUpdates();
  }
}

/**
 * Saga that is responsible for periodically updating the statistics part of the
 * state store.
 */
function* statisticsSaga() {
  const delayBetweenUpdates = Math.ceil(1000 / UPDATE_RATE);

  while (true) {
    yield delay(delayBetweenUpdates);

    yield* syncCountersToStore();

    if (updateRecenciesUntil !== null) {
      const now = performance.now();
      if (now > updateRecenciesUntil) {
        updateRecenciesUntil = null;
      } else {
        yield put(updateRecencyScores());
      }
    }
  }
}

export default statisticsSaga;
