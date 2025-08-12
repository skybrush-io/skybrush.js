import { styled } from '@mui/material/styles';
import { Status } from '@skybrush/app-theme-mui';
import clsx from 'clsx';
import React from 'react';

import { createStyleForStatus, createStyleForHollowStatus } from './styles';

const FLASH_STYLE = {
  animation: '$flash 0.5s infinite',
  animationDirection: 'alternate',
};

/* eslint-disable @typescript-eslint/naming-convention */
const StyledDiv = styled('div')(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  fontSize: 'small',
  overflow: 'hidden',
  padding: `0 ${theme.spacing(0.5)}`,
  textAlign: 'center',
  textTransform: 'uppercase',
  userSelect: 'none',
  whiteSpace: 'nowrap',

  '&.StatusPill-position-left': {
    borderRadius: theme.spacing(1, 0, 0, 1),
  },

  '&.StatusPill-position-right': {
    borderRadius: theme.spacing(0, 1, 1, 0),
  },

  '&.StatusPill-position-single': {
    borderRadius: theme.spacing(1),
  },

  '&.StatusPill-position-middle': {},

  '&.StatusPill-fullWidth': {
    width: '100%',
  },

  '&.StatusPill-inline': {
    display: 'inline-block',
  },

  '&.StatusPill-status-off': createStyleForStatus(Status.OFF, theme),
  '&.StatusPill-status-info': createStyleForStatus(Status.INFO, theme),
  '&.StatusPill-status-waiting': createStyleForStatus(Status.WAITING, theme),
  '&.StatusPill-status-next': createStyleForStatus(Status.NEXT, theme),
  '&.StatusPill-status-success': createStyleForStatus(Status.SUCCESS, theme),
  '&.StatusPill-status-skipped': createStyleForStatus(Status.SKIPPED, theme),
  '&.StatusPill-status-warning': createStyleForStatus(Status.WARNING, theme, {
    bold: true,
  }),
  '&.StatusPill-status-rth': {
    ...createStyleForStatus(Status.RTH, theme, { bold: true }),
    ...FLASH_STYLE,
  },
  '&.StatusPill-status-error': createStyleForStatus(Status.ERROR, theme, {
    bold: true,
  }),
  '&.StatusPill-status-critical': {
    ...createStyleForStatus(Status.CRITICAL, theme, { bold: true }),
    ...FLASH_STYLE,
  },
  '&.StatusPill-status-missing': createStyleForStatus(Status.MISSING, theme, {
    bold: true,
  }),

  '&.StatusPill-status-hollow-off': createStyleForHollowStatus(
    Status.OFF,
    theme
  ),
  '&.StatusPill-status-hollow-info': createStyleForHollowStatus(
    Status.INFO,
    theme
  ),
  '&.StatusPill-status-hollow-waiting': createStyleForHollowStatus(
    Status.WAITING,
    theme
  ),
  '&.StatusPill-status-hollow-next': createStyleForHollowStatus(
    Status.NEXT,
    theme
  ),
  '&.StatusPill-status-hollow-success': createStyleForHollowStatus(
    Status.SUCCESS,
    theme
  ),
  '&.StatusPill-status-hollow-skipped': createStyleForHollowStatus(
    Status.SKIPPED,
    theme
  ),
  '&.StatusPill-status-hollow-warning': createStyleForHollowStatus(
    Status.WARNING,
    theme,
    { bold: true }
  ),
  '&.StatusPill-status-hollow-rth': {
    ...createStyleForHollowStatus(Status.RTH, theme, { bold: true }),
    ...FLASH_STYLE,
  },
  '&.StatusPill-status-hollow-error': createStyleForHollowStatus(
    Status.ERROR,
    theme,
    {
      bold: true,
    }
  ),
  '&.StatusPill-status-hollow-critical': {
    ...createStyleForHollowStatus(Status.CRITICAL, theme, { bold: true }),
    ...FLASH_STYLE,
  },
  '&.StatusPill-status-hollow-missing': createStyleForHollowStatus(
    Status.MISSING,
    theme,
    { bold: true }
  ),

  '@keyframes flash': {
    '0%, 49%': {
      opacity: 0.5,
    },
    '50%, 100%': {
      opacity: 1,
    },
  },
}));
/* eslint-enable @typescript-eslint/naming-convention */

type StatusPillProps = Readonly<{
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
  hollow?: boolean;
  position?: 'left' | 'right' | 'middle' | 'single';
  status?: Status;
}>;

/**
 * Summary pill that can be placed below the drone avatar to show a single
 * line of additional textual information.
 */
const StatusPill = ({
  children,
  className,
  inline,
  hollow,
  position = 'single',
  status = Status.INFO,
  ...rest
}: StatusPillProps): JSX.Element => (
  <StyledDiv
    className={clsx(
      className,
      inline ? 'StatusPill-inline' : 'StatusPill-fullWidth',
      `StatusPill-position-${position}`,
      hollow
        ? `StatusPill-status-hollow-${status}`
        : `StatusPill-status-${status}`
    )}
    {...rest}
  >
    {children}
  </StyledDiv>
);

export default StatusPill;
