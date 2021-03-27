/**
 * Returns the current UI theme to use.
 */
export function getTheme(state) {
  const { theme } = state.settings;
  return theme || 'auto';
}
