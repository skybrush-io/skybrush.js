import { getRTKStatistics } from './selectors';
import { updateRTKStatistics } from './slice';

function getRecencyScoreFromTimestamp(timestamp) {
  const now = Date.now();
  if (now - timestamp < 3000) {
    return 2;
  }

  if (now - timestamp < 10_000) {
    return 1;
  }

  return 0;
}

export function updateRecencyScores() {
  return (dispatch, getState) => {
    const state = getState();
    const { timestamp } = getRTKStatistics(state);
    dispatch(
      updateRTKStatistics({ recency: getRecencyScoreFromTimestamp(timestamp) })
    );
  };
}
