import React from 'react';

import Avatar, { type AvatarProps } from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

import { colorForStatus, Status } from '@skybrush/app-theme-mui';

import { fade, flash } from './keyframes.js';
import { createStyleForStatus } from './styles.js';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  border: '1px solid rgba(0, 0, 0, 0.3)',

  // Alternatively we could use `variant="rounded"` and
  // set the amount through `theme.shape.borderRadius`.
  borderRadius: '25%',

  color: 'black',
  margin: '0 auto',

  '&.StyledAvatar-critical': {
    ...createStyleForStatus(Status.CRITICAL, theme, { glow: true }),
    animation: `${flash} 0.5s infinite`,
    animationDirection: 'alternate',
  },

  '&.StyledAvatar-error': createStyleForStatus(Status.ERROR, theme, {
    glow: true,
  }),
  '&.StyledAvatar-info': createStyleForStatus(Status.INFO, theme),
  '&.StyledAvatar-next': {
    ...createStyleForStatus(Status.NEXT, theme),
    overflow: 'initial', // needed to let the glow be visible around the edges
  },
  '&.StyledAvatar-next::after': {
    content: '""',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: '50%',
    boxShadow: `0 0 8px 2px ${colorForStatus(Status.INFO)}`,
    animation: `${fade} 0.5s infinite`,
    animationDirection: 'alternate',
  },
  '&.StyledAvatar-off': createStyleForStatus(Status.OFF, theme),
  '&.StyledAvatar-rth': {
    ...createStyleForStatus(Status.WARNING, theme, { glow: true }),
    animation: `${flash} 0.5s infinite`,
    animationDirection: 'alternate',
  },
  '&.StyledAvatar-skipped': createStyleForStatus(Status.SKIPPED, theme),
  '&.StyledAvatar-success': createStyleForStatus(Status.SUCCESS, theme),
  '&.StyledAvatar-waiting': createStyleForStatus(Status.WAITING, theme),
  '&.StyledAvatar-warning': createStyleForStatus(Status.WARNING, theme, {
    glow: true,
  }),
  '&.StyledAvatar-missing': createStyleForStatus(Status.MISSING, theme),
}));

export interface SemanticAvatarProps extends AvatarProps {
  status: Status;
  children: React.ReactNode;
}

/**
 * Avatar that represents a single drone, docking station or some other object
 * in the system that has an ID.
 */
const SemanticAvatar = ({
  children,
  status = Status.OFF,
  ...rest
}: SemanticAvatarProps) => (
  <StyledAvatar className={`StyledAvatar-${status}`} {...rest}>
    {children}
  </StyledAvatar>
);

export default SemanticAvatar;
