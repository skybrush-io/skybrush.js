import type { CSSProperties } from 'react';

import type { Theme } from '@mui/material/styles';

import { isThemeDark } from './theme.js';

type SecondaryAreaStyleOptions = {
  flat?: boolean;
  inset?: 'top' | 'bottom' | 'left' | 'right' | 'all' | true;
};

type DarkAwareStyleFunc = (isDark: boolean) => CSSProperties;

/**
 * Creates a style for a secondary area with an inset appearance that can be
 * used for charts, sidebars and other display widgets.
 */
export const createSecondaryAreaStyle = (
  theme: Theme,
  options?: SecondaryAreaStyleOptions
) => secondaryAreaStyle(options)(theme);

const getGradientAngleForInset = (
  inset: SecondaryAreaStyleOptions['inset']
): number => {
  switch (inset) {
    case 'top':
      return 160;
    case 'left':
      return 70;
    case 'bottom':
      return 340;
    case 'right':
      return 250;
    default:
      return 160;
  }
};

const createBackgroundFuncForSecondaryAreaStyle = ({
  flat,
  inset,
}: SecondaryAreaStyleOptions): DarkAwareStyleFunc => {
  const angle = getGradientAngleForInset(inset);
  return flat
    ? (dark) => ({
        background: dark ? '#1f1f1f' : '#fafafa',
      })
    : (dark) => ({
        background: dark
          ? `linear-gradient(${angle}deg, #2c2c2c 0%, #1f1f1f 100%)`
          : '#fafafa',
      });
};

const createExtraStyleFuncForSecondaryAreaStyle = ({
  inset,
}: SecondaryAreaStyleOptions): DarkAwareStyleFunc => {
  switch (inset) {
    case 'top':
      return (dark) => ({
        borderTop: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '0 2px 6px -2px inset rgba(0, 0, 0, 0.54)',
      });

    case 'bottom':
      return (dark) => ({
        borderBottom: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '0 -2px 6px -2px inset rgba(0, 0, 0, 0.54)',
      });

    case 'left':
      return (dark) => ({
        borderLeft: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '2px 0 6px -2px inset rgba(0, 0, 0, 0.54)',
      });

    case 'right':
      return (dark) => ({
        borderRight: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '-2px 0 6px -2px inset rgba(0, 0, 0, 0.54)',
      });

    default:
      return (dark) => ({
        border: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '0 0 6px -2px inset rgba(0, 0, 0, 0.54)',
      });
  }
};

/**
 * Creates a style for a secondary area with an inset appearance that can be
 * used for charts, sidebars and other display widgets.
 */
export const secondaryAreaStyle = (
  options: SecondaryAreaStyleOptions = {}
): ((theme: Theme) => CSSProperties) => {
  const backgroundFunc = createBackgroundFuncForSecondaryAreaStyle(options);
  const extraStyleFunc = createExtraStyleFuncForSecondaryAreaStyle(options);

  return (theme: Theme) => {
    const dark = isThemeDark(theme);
    return {
      display: 'flex',
      ...backgroundFunc(dark),
      ...extraStyleFunc(dark),
    };
  };
};
