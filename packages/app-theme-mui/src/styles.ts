import type { CSSProperties } from 'react';

import type { Theme } from '@mui/material/styles';

import { isThemeDark } from './theme';

interface SecondaryAreaStyleOptions {
  inset?: 'top' | 'bottom' | 'left' | 'right' | 'all' | true;
}

/**
 * Creates a style for a secondary area with an inset appearance that can be
 * used for charts, sidebars and other display widgets.
 */
export const createSecondaryAreaStyle = (
  theme: Theme,
  options?: SecondaryAreaStyleOptions
) => secondaryAreaStyle(options)(theme);

const createExtraStyleFuncForSecondaryAreaStyle = (
  inset: SecondaryAreaStyleOptions['inset']
): ((isDark: boolean) => CSSProperties) => {
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
export const secondaryAreaStyle = ({
  inset,
}: SecondaryAreaStyleOptions = {}): ((theme: Theme) => CSSProperties) => {
  const extraStyleFunc = createExtraStyleFuncForSecondaryAreaStyle(inset);

  return (theme: Theme) => {
    const dark = isThemeDark(theme);

    return {
      background: dark
        ? 'linear-gradient(160deg, #2c2c2c 0%, #1f1f1f 100%)'
        : '#fafafa',
      display: 'flex',
      ...extraStyleFunc(dark),
    };
  };
};
