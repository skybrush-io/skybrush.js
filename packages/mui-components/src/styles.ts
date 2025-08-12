import type { Theme } from '@mui/material/styles';
import { colorForStatus, type Status } from '@skybrush/app-theme-mui';

type CreateStyleOptions = {
  bold?: boolean;
  glow?: boolean;
};

export const createStyleForStatus = (
  status: Status,
  theme: Theme,
  { bold, glow }: CreateStyleOptions = {}
) => {
  const backgroundColor = colorForStatus(status);
  const result: React.CSSProperties = {
    backgroundColor,
    color: theme.palette.getContrastText(backgroundColor),
  };

  if (bold) {
    result.fontWeight = 'bold';
  }

  if (glow) {
    result.boxShadow = `0 0 8px 2px ${backgroundColor}`;
  }

  return result;
};

export const createStyleForHollowStatus = (
  status: Status,
  { bold, glow }: CreateStyleOptions = {}
) => {
  const color = colorForStatus(status);
  const result: React.CSSProperties = { color };

  if (bold) {
    result.fontWeight = 'bold';
  }

  if (glow) {
    result.boxShadow = `0 0 8px 2px ${color}`;
  }

  return result;
};
