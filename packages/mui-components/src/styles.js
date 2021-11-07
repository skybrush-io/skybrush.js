import { colorForStatus } from '@skybrush/app-theme-mui';

export const createStyleForStatus = (status, theme, { glow } = {}) => {
  const backgroundColor = colorForStatus(status);
  const result = {
    backgroundColor,
    color: theme.palette.getContrastText(backgroundColor),
  };

  if (glow) {
    result.boxShadow = `0 0 8px 2px ${backgroundColor}`;
  }

  return result;
};
