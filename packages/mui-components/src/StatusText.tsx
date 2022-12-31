import { css, styled } from '@mui/material/styles';
import type { SerializedStyles } from '@mui/styled-engine';
import { Colors, type Status } from '@skybrush/app-theme-mui';

import { dimFlash } from './keyframes';

const cssByColor: Record<string, SerializedStyles> = Object.fromEntries(
  ['info', 'warning', 'success', 'error'].map((color) => [
    color,
    css({ color: (Colors as any)[color] as string }),
  ])
);

const boldCss = css({ fontWeight: 'bold' });
const flashCss = css({
  animation: `${dimFlash} 0.5s infinite`,
  animationDirection: 'alternate',
});

// eslint-disable-next-line @typescript-eslint/ban-types
const styles: Record<Status, SerializedStyles | null> = {
  info: cssByColor.info,
  waiting: cssByColor.info,
  next: cssByColor.info,
  success: cssByColor.success,
  skipped: cssByColor.warning,
  warning: css([cssByColor.warning, boldCss]),
  rth: css([cssByColor.warning, boldCss, flashCss]),
  error: css([cssByColor.error, boldCss]),
  critical: css([cssByColor.error, boldCss, flashCss]),
  off: null,
  missing: null,
};

const StatusText = styled('span', {
  shouldForwardProp: (name) => name !== 'status',
})<{ status: Status }>(({ status }) => styles[status]);

export default StatusText;
