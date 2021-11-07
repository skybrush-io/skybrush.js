import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { Colors, Status } from '@skybrush/app-theme-mui';

import { flash, ripple } from './keyframes';
import { createStyleForStatus } from './styles';

const StyledBox = styled(Box)(({ theme }) => ({
  border: '1px solid rgba(0, 0, 0, 0.3)',
  borderRadius: '50%',
  color: 'black',
  height: '1em',
  minWidth:
    '1em' /* needed for narrow cases; setting width alone is not enough */,
  marginRight: theme.spacing(2),
  position: 'relative',
  width: '1em',

  '&.StatusLight-inline': {
    display: 'inline-block',
    marginRight: 0,
  },

  '&.StatusLight-size-small': {
    fontSize: '0.75rem',
  },

  '&.StatusLight-size-large': {
    fontSize: '1.25rem',
  },

  '&.StatusLight-status-critical': {
    ...createStyleForStatus(Status.CRITICAL, theme, { glow: true }),
    animation: `${flash} 0.5s infinite`,
    animationDirection: 'alternate',
  },

  '&.StatusLight-status-error': createStyleForStatus(Status.ERROR, theme, {
    glow: true,
  }),
  '&.StatusLight-status-info': createStyleForStatus(Status.INFO, theme),
  '&.StatusLight-status-next': {
    ...createStyleForStatus(Status.NEXT, theme),
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: `${ripple} 1.2s infinite ease-in-out`,
      border: `2px solid ${Colors.info}`,
      content: '""',
    },
  },

  '&.StatusLight-status-off': createStyleForStatus(Status.OFF, theme),
  '&.StatusLight-status-rth': {
    ...createStyleForStatus(Status.RTH, theme, { glow: true }),
    animation: `${flash} 0.5s infinite`,
    animationDirection: 'alternate',
  },

  '&.StatusLight-status-skipped': createStyleForStatus(Status.SKIPPED, theme, {
    glow: true,
  }),
  '&.StatusLight-status-success': createStyleForStatus(Status.SUCCESS, theme),
  '&.StatusLight-status-warning': createStyleForStatus(Status.WARNING, theme, {
    glow: true,
  }),
  '&.StatusLight-status-waiting': {
    ...createStyleForStatus(Status.WAITING, theme),
    animation: `${flash} 0.5s infinite`,
    animationDirection: 'alternate',
  },
}));

/**
 * Small component resembling a multi-color status light that can be used to
 * represent the state of a single step in a multi-step process.
 */
const StatusLight = ({ inline, size, status, ...rest }) => (
  <StyledBox
    className={clsx(
      inline && 'StatusLight-inline',
      `StatusLight-size-${size}`,
      `StatusLight-status-${status}`
    )}
    component={inline ? 'span' : 'div'}
    {...rest}
  />
);

StatusLight.propTypes = {
  inline: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'normal', 'large']),
  status: PropTypes.oneOf(Object.values(Status)),
};

StatusLight.defaultProps = {
  status: 'off',
  size: 'normal',
};

export default StatusLight;
