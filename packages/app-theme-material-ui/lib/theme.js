/**
 * @file Theme setup for Material-UI.
 */

import PropTypes from 'prop-types';
import React from 'react';

import { blue, lightBlue, orange, blueGrey } from '@material-ui/core/colors';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { ThemeProvider } from '@material-ui/core/styles';

import { Colors } from './colors';
import { defaultFont } from './fonts';
import useDarkMode from './hooks/useDarkMode';

/**
 * Helper function that returns whether the given Material UI theme is a dark theme.
 */
export const isThemeDark = (theme) => theme.palette.type === 'dark';

const themeProviderDefaults = {
  primaryColor: (isDark) => (isDark ? orange : blue),
  secondaryColor: (isDark) => (isDark ? lightBlue : blueGrey),
};

/**
 * Function that creates a theme provider given the preferred primary and secondary
 * color of the app.
 *
 * @param primaryColor  the primary color of the app. Can be a Material UI
 *        color or a function that takes a boolean that defines whether the user
 *        prefers dark mode or not, and returns a color.
 * @param secondaryColor  the secondary color of the app. Can be a Material UI
 *        color or a function that takes a boolean that defines whether the user
 *        prefers dark mode or not, and returns a color.
 */
export const createThemeProvider = ({
  primaryColor = themeProviderDefaults.primaryColor,
  secondaryColor = themeProviderDefaults.secondaryColor,
} = {}) => {
  const DarkModeAwareThemeProvider = ({ children, type }) => {
    const osHasDarkMode = useDarkMode();
    const isThemeDark = (type === 'auto' && osHasDarkMode) || type === 'dark';

    // Create the Material-UI theme that we are going to use
    const theme = createMuiTheme({
      palette: {
        type: isThemeDark ? 'dark' : 'light',
        primary:
          typeof primaryColor === 'function'
            ? primaryColor(isThemeDark)
            : primaryColor,
        secondary:
          typeof secondaryColor === 'function'
            ? secondaryColor(isThemeDark)
            : secondaryColor,

        success: {
          main: Colors.success,
        },
      },

      typography: {
        fontFamily: defaultFont,
      },

      overrides: {
        MuiList: {
          root: {
            background: isThemeDark ? '#424242' : '#fff',
          },
        },

        MuiTab: {
          root: {
            minWidth: 80,
          },
        },
      },

      // Customize z indices to ensure that react-toast-notifications appear
      // above Material-UI stuff. (react-toast-notifications has a Z index of
      // 1000 and it is hard to customize)
      zIndex: {
        mobileStepper: 600,
        speedDial: 650,
        appBar: 700,
        drawer: 800,
        modal: 900,
        snackbar: 1000,
        tooltip: 1100,
      },
    });

    /* Request from Ubi and Soma: selection should have more contrast; 0.08 is
     * the default */
    theme.palette.action.selected = isThemeDark
      ? 'rgba(255, 255, 255, 0.16)'
      : 'rgba(0, 0, 0, 0.16)';
    theme.palette.action.selectedOpacity = 0.16;

    /* This is needed to make sure that the tab width we prescribed is not
     * overwritten by more specific media queries */

    theme.overrides.MuiTab.root[theme.breakpoints.up('xs')] = {
      minWidth: theme.overrides.MuiTab.root.minWidth,
    };

    return React.createElement(ThemeProvider, { theme }, children);
  };

  DarkModeAwareThemeProvider.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
    type: PropTypes.oneOf(['auto', 'dark', 'light']),
  };

  return DarkModeAwareThemeProvider;
};
