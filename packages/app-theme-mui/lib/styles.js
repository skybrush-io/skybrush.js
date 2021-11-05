import { isThemeDark } from './theme';

/**
 * Creates a style for a secondary area with an inset appearance that can be
 * used for charts, sidebars and other display widgets.
 */
export const createSecondaryAreaStyle = (theme, { inset } = {}) => {
  const dark = isThemeDark(theme);

  const style = {
    background: dark
      ? 'linear-gradient(160deg, #2c2c2c 0%, #1f1f1f 100%)'
      : '#fafafa',
  };

  switch (inset) {
    case 'top':
      Object.assign(style, {
        borderTop: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '0 2px 6px -2px inset rgba(0, 0, 0, 0.54)',
      });
      break;

    case 'bottom':
      Object.assign(style, {
        borderBottom: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '0 -2px 6px -2px inset rgba(0, 0, 0, 0.54)',
      });
      break;

    case 'left':
      Object.assign(style, {
        borderLeft: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '2px 0 6px -2px inset rgba(0, 0, 0, 0.54)',
      });
      break;

    case 'right':
      Object.assign(style, {
        borderRight: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '-2px 0 6px -2px inset rgba(0, 0, 0, 0.54)',
      });
      break;

    default:
      Object.assign(style, {
        border: `1px solid ${
          dark ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
        }`,
        boxShadow: '0 0 6px -2px inset rgba(0, 0, 0, 0.54)',
      });
  }

  return style;
};
