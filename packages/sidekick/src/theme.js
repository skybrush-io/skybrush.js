/**
 * @file Theme setup for Material-UI.
 */

import { connect } from 'react-redux';

import { common, green, lightGreen } from '@material-ui/core/colors';

import { createThemeProvider } from '@skybrush/app-theme-material-ui';

import { getTheme } from './features/settings/selectors';

/**
 * Helper function that returns whether the given Material UI theme is a dark theme.
 */
export const isDark = (theme) => theme.palette.type === 'dark';

/**
 * Specialized Material-UI theme provider that is aware about the user's
 * preference about whether to use a dark or a light theme.
 */
const DarkModeAwareThemeProvider = createThemeProvider({
  primaryColor: (isDark) => ({
    main: isDark ? green[500] : green[700],
    contrastText: common.white,
  }),
  secondaryColor: (isDark) => (isDark ? lightGreen : green),
});

export default connect(
  // mapStateToProps
  (state) => ({
    type: getTheme(state),
  })
)(DarkModeAwareThemeProvider);
