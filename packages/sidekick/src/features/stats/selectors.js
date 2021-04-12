export function getRTKConnectionState(state) {
  switch (state.stats.rtk.recency) {
    case 0:
      return 'disconnected';

    case 1:
      return 'disconnecting';

    default:
      return 'connected';
  }
}

export function getRTKStatistics(state) {
  return state.stats.rtk;
}
