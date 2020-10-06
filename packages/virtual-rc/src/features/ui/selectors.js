/**
 * Returns the current UI screen to show in the main window.
 */
export function getCurrentScreen(state) {
  const { screen } = state.ui || {};
  return screen || 'main';
}
