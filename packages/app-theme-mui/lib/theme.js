/**
 * @file Theme setup for Material-UI.
 */

import PropTypes from 'prop-types';
import React from 'react';

import { blue, lightBlue, orange, blueGrey } from '@mui/material/colors';
import {
  ThemeProvider,
  StyledEngineProvider,
  adaptV4Theme,
  createTheme,
} from '@mui/material/styles';

import { Colors } from './colors';
import { defaultFont } from './fonts';
import useConditionalCSS from './hooks/useConditionalCSS';
import useDarkMode from './hooks/useDarkMode';

/**
 * Constant that decides whether we are on macOS (where we don't need extra
 * scrollbar styling).
 */
const isMacOs = navigator.platform.toUpperCase().includes('MAC');

/**
 * CSS for scrollbars.
 */
const cssForScrollbars = {
  light: `
  /* Nicer scroll bars on Windows */
  ::-webkit-scrollbar {
    width: 10px;
  }
  /* Change the color of the scrollbar track */
  ::-webkit-scrollbar-track {
    background: rgb(244, 244, 244);
  }
  /* Change the color of the scrollbar handle */
  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.26);
    border: 1px solid rgb(244, 244, 244);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.54);
  }
  `,
  dark: `
  /* Nicer scroll bars on Windows */
  ::-webkit-scrollbar {
    width: 10px;
  }
  /* Change the color of the scrollbar track */
  ::-webkit-scrollbar-track {
    background: rgb(68, 68, 68) !important;
  }
  /* Change the color of the scrollbar handle */
  ::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.26) !important;
    border: 1px solid rgb(68, 68, 68) !important;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.54) !important;
  }
  `,
};

/**
 * Helper function that returns whether the given Material UI theme is a dark theme.
 */
export const isThemeDark = (theme) => theme.palette.mode === 'dark';

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
    const theme = createTheme(
      adaptV4Theme({
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
          fontSize: 14,
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
      })
    );

    /* Request from Ubi and Soma: selection should have more contrast; 0.08 is
     * the default */
    theme.palette.action.selected = isThemeDark
      ? 'rgba(255, 255, 255, 0.16)'
      : 'rgba(0, 0, 0, 0.16)';
    theme.palette.action.selectedOpacity = 0.16;

    /* This is needed to make sure that the tab width we prescribed is not
     * overwritten by more specific media queries */

    theme.components.MuiTab.styleOverrides.root[theme.breakpoints.up('xs')] = {
      minWidth: theme.components.MuiTab.styleOverrides.root.minWidth,
    };

    useConditionalCSS(cssForScrollbars.dark, !isMacOs && isThemeDark);
    useConditionalCSS(cssForScrollbars.light, !isMacOs && !isThemeDark);

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
