/**
 * @file Theme setup for Material-UI.
 */

import * as React from 'react';

import { blue, blueGrey, grey, lightBlue, orange } from '@mui/material/colors';
import type { PaletteColorOptions, Theme } from '@mui/material/styles';
import { ThemeProvider, alpha, createTheme } from '@mui/material/styles';

import { Colors } from './colors';
import { defaultFont } from './fonts';
import useConditionalCSS from './hooks/useConditionalCSS';
import useDarkMode from './hooks/useDarkMode';

/**
 * Types of themes that we support in this framework.
 */
export enum ThemeType {
  AUTO = 'auto',
  DARK = 'dark',
  LIGHT = 'light',
}

/**
 * Converts a string into a ThemeType enum value.
 */
export function toThemeType(value: string): ThemeType {
  switch (value.toLowerCase()) {
    case 'auto':
      return ThemeType.AUTO;
    case 'dark':
      return ThemeType.DARK;
    case 'light':
      return ThemeType.LIGHT;
    default:
      return ThemeType.AUTO;
  }
}

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
} as const;

/**
 * Helper function that returns whether the given Material UI theme is a dark theme.
 */
export const isThemeDark = (theme: Theme) => theme.palette.mode === 'dark';

export interface DarkModeAwareThemeProviderOptions {
  primaryColor?:
    | PaletteColorOptions
    | ((isDark: boolean) => PaletteColorOptions);
  secondaryColor?:
    | PaletteColorOptions
    | ((isDark: boolean) => PaletteColorOptions);
}

export interface DarkModeAwareThemeProviderProps {
  type: ThemeType;
  children: React.ReactNode;
}

const themeProviderDefaults: DarkModeAwareThemeProviderOptions = {
  primaryColor: (isDark: boolean) => (isDark ? orange : blue),
  secondaryColor: (isDark: boolean) => (isDark ? lightBlue : blueGrey),
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
}: DarkModeAwareThemeProviderOptions = {}) => {
  const DarkModeAwareThemeProvider = ({
    children,
    type,
  }: DarkModeAwareThemeProviderProps) => {
    const osHasDarkMode = useDarkMode();
    const isThemeDark =
      (type === ThemeType.AUTO && osHasDarkMode) || type === ThemeType.DARK;

    const muiV4Compat = <T>(props: T): T => props;

    // Create the Material-UI theme that we are going to use
    const baseTheme = createTheme({
      palette: {
        mode: isThemeDark ? 'dark' : 'light',
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

        // Compatibility with Material UI v4
        background: isThemeDark
          ? {
              paper: '#424242',
              default: '#303030',
            }
          : {
              paper: '#fff',
              default: '#fafafa',
            },

        /* eslint-disable @typescript-eslint/no-unsafe-assignment */

        // Compatibility with Material UI v4
        text: {
          hint: isThemeDark
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(0, 0, 0, 0.38)',
        } as any,

        // Compatibility with Material UI v4 and to allow <Button color="gray">
        grey: {
          main: grey[300],
          dark: grey[400],
        } as any,

        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      },

      typography: {
        fontFamily: defaultFont,
        fontSize: 14,
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

    const theme = createTheme(baseTheme, {
      components: {
        MuiCssBaseline: {
          // See https://mui.com/material-ui/migration/v5-component-changes/#update-body-font-size
          styleOverrides: {
            body: {
              fontSize: '0.875rem',
              lineHeight: 1.43,
            },
          },
        },
        // Support for "grey" color of buttons for compatibility with Material UI v4
        MuiButton: {
          variants: [
            {
              props: { variant: 'contained', color: 'grey' },
              style: {
                color: baseTheme.palette.getContrastText(
                  baseTheme.palette.grey[300]
                ),
              },
            },
            {
              props: { variant: 'outlined', color: 'grey' },
              style: {
                color: baseTheme.palette.text.primary,
                borderColor:
                  baseTheme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.23)'
                    : 'rgba(255, 255, 255, 0.23)',
                '&.Mui-disabled': {
                  border: `1px solid ${baseTheme.palette.action.disabledBackground}`,
                },
                '&:hover': {
                  borderColor:
                    baseTheme.palette.mode === 'light'
                      ? 'rgba(0, 0, 0, 0.23)'
                      : 'rgba(255, 255, 255, 0.23)',
                  backgroundColor: alpha(
                    baseTheme.palette.text.primary,
                    baseTheme.palette.action.hoverOpacity
                  ),
                },
              },
            },
            {
              props: { color: 'grey', variant: 'text' },
              style: {
                color: baseTheme.palette.text.primary,
                '&:hover': {
                  backgroundColor: alpha(
                    baseTheme.palette.text.primary,
                    baseTheme.palette.action.hoverOpacity
                  ),
                },
              },
            },
          ],

          ...muiV4Compat({
            defaultProps: {
              color: 'grey',
            },
          }),
        },

        // Checkboxes should use the secondary color by default (Material UI v4 compatibility)
        MuiCheckbox: muiV4Compat({
          defaultProps: {
            color: 'secondary',
          },
        }),

        // DialogContent should have a smaller vertical padding
        MuiDialogContent: {
          styleOverrides: {
            root: {
              paddingTop: baseTheme.spacing(1),
              paddingBottom: baseTheme.spacing(1),
            },
          },
        },

        // Override list background
        MuiList: {
          styleOverrides: {
            root: {
              background: baseTheme.palette.background.paper,
            },
          },
        },

        // MUI 5 lightens the background of MuiPaper when the elevation
        // increases, which tints the UI in an undesired manner if the theme
        // was originally designed for MUI 4.
        MuiPaper: muiV4Compat({
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        }),

        // Radio buttons should use the secondary color by default (Material UI v4 compatibility)
        MuiRadio: muiV4Compat({
          defaultProps: {
            color: 'secondary',
          },
        }),

        // Decrease tab width
        MuiTab: {
          styleOverrides: {
            root: {
              minWidth: 80,
            },
          },
        },

        // Tabs should use the secondary color by default for the indicator
        // and plain white for the text (Material UI v4 compatibility)
        MuiTabs: muiV4Compat({
          defaultProps: {
            indicatorColor: 'secondary',
            textColor: 'inherit',
          },
        }),

        // Captions should be mapped to a <div> tag, not to a <span>
        // (Material UI v4 compatibility)
        MuiTypography: muiV4Compat({
          defaultProps: {
            variantMapping: {
              h1: 'h1',
              h2: 'h2',
              h3: 'h3',
              h4: 'h4',
              h5: 'h5',
              h6: 'h6',
              subtitle1: 'h6',
              subtitle2: 'h6',
              body1: 'p',
              body2: 'p',
              caption: 'div',
              inherit: 'p',
            },
          },
        }),
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

    (theme.components!.MuiTab!.styleOverrides!.root! as any)[
      theme.breakpoints.up('xs')
    ] = {
      minWidth: (
        theme.components!.MuiTab!.styleOverrides!.root as { minWidth: number }
      ).minWidth,
    };

    useConditionalCSS(cssForScrollbars.dark, !isMacOs && isThemeDark);
    useConditionalCSS(cssForScrollbars.light, !isMacOs && !isThemeDark);

    return React.createElement(ThemeProvider, { theme }, children);
  };

  return DarkModeAwareThemeProvider;
};
