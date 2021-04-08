export function getPendingUAVId(state) {
  return state.keyboard.pendingUAVId > 0
    ? state.keyboard.pendingUAVId
    : undefined;
}

export function hasPendingUAVId(state) {
  return state.keyboard.pendingUAVId > 0;
}
