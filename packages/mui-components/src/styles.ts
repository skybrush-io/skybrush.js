import { Theme } from '@mui/material/styles';
import { colorForStatus, Status } from '@skybrush/app-theme-mui';

export const createStyleForStatus = (
  status: Status,
  theme: Theme,
  { glow }: { glow?: boolean } = {}
) => {
  const backgroundColor = colorForStatus(status);
  const result: React.CSSProperties = {
    backgroundColor,
    color: theme.palette.getContrastText(backgroundColor),
  };

  if (glow) {
    result.boxShadow = `0 0 8px 2px ${backgroundColor}`;
  }

  return result;
};
