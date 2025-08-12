import type { Theme } from '@mui/material/styles';
import { colorForStatus, Status } from '@skybrush/app-theme-mui';

type CreateStyleOptions = {
  bold?: boolean;
  glow?: boolean;
};

export const createStyleForStatus = (
  status: Status,
  theme: Theme,
  { bold, glow }: CreateStyleOptions = {}
) => {
  // Status.OFF needs an override; the color should be theme-dependent to make
  // it look good both with dark and light themes.
  const result: React.CSSProperties = {};
  if (status === Status.OFF) {
    result.backgroundColor = theme.palette.action.selected;
    // getContrastText() is misled by the small alpha component of backgroundColor
    result.color = theme.palette.text.primary;
  } else {
    const backgroundColor = colorForStatus(status);
    result.backgroundColor = backgroundColor;
    result.color = theme.palette.getContrastText(backgroundColor);
  }

  if (bold) {
    result.fontWeight = 'bold';
  }

  if (glow) {
    result.boxShadow = `0 0 8px 2px ${result.backgroundColor}`;
  }

  return result;
};

export const createStyleForHollowStatus = (
  status: Status,
  theme: Theme,
  { bold, glow }: CreateStyleOptions = {}
) => {
  // Status.OFF needs an override; the color should be theme-dependent to make
  // it look good both with dark and light themes.
  const color =
    status === Status.OFF
      ? theme.palette.text.secondary
      : colorForStatus(status);
  const result: React.CSSProperties = { color, outline: `1px solid ${color}` };

  if (bold) {
    result.fontWeight = 'bold';
  }

  if (glow) {
    result.boxShadow = `0 0 8px 2px ${color}`;
  }

  return result;
};
