/**
 * @file Theme setup for Material-UI.
 */

import { connect } from 'react-redux';

import { lightBlue, green } from '@mui/material/colors';

import { createThemeProvider } from '@skybrush/app-theme-mui';

import { getTheme } from './features/settings/selectors';

/**
 * Helper function that returns whether the given Material UI theme is a dark theme.
 */
export const isDark = (theme) => theme.palette.mode === 'dark';

/**
 * Specialized Material-UI theme provider that is aware about the user's
 * preference about whether to use a dark or a light theme.
 */
const DarkModeAwareThemeProvider = createThemeProvider({
  primaryColor: green, // (isDark) => (isDark ? green : blue),
  secondaryColor: (isDark) => (isDark ? lightBlue : green),
});

export default connect(
  // mapStateToProps
  (state) => ({
    type: getTheme(state),
  })
)(DarkModeAwareThemeProvider);
