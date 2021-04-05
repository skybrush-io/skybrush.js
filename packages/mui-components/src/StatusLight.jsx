import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import {
  colorForStatus,
  Colors,
  Status,
} from '@skybrush/app-theme-material-ui';

const createStyleForStatus = (status, theme, { glow } = {}) => {
  const backgroundColor = colorForStatus(status);
  const result = {
    backgroundColor,
    color: theme.palette.getContrastText(backgroundColor),
  };

  if (glow) {
    result.boxShadow = `0 0 4px 1px ${backgroundColor}`;
  }

  return result;
};

const useStyles = makeStyles(
  (theme) => ({
    root: {
      border: '1px solid rgba(0, 0, 0, 0.3)',
      borderRadius: '50%',
      color: 'black',
      height: '1em',
      minWidth:
        '1em' /* needed for narrow cases; setting width alone is not enough */,
      marginRight: theme.spacing(2),
      position: 'relative',
      width: '1em',
    },

    inline: {
      display: 'inline-block',
      marginRight: [0, '!important'],
    },

    'size-small': {
      fontSize: '0.75em',
    },

    'size-large': {
      fontSize: '1.25em',
    },

    'status-critical': {
      ...createStyleForStatus(Status.CRITICAL, theme, { glow: true }),
      animation: '$flash 0.5s infinite',
      animationDirection: 'alternate',
    },

    'status-error': createStyleForStatus(Status.ERROR, theme, { glow: true }),
    'status-info': createStyleForStatus(Status.INFO, theme),
    'status-next': {
      ...createStyleForStatus(Status.NEXT, theme),
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: '$ripple 1.2s infinite ease-in-out',
        border: `2px solid ${Colors.info}`,
        content: '""',
      },
    },

    'status-off': createStyleForStatus(Status.OFF, theme),
    'status-rth': {
      ...createStyleForStatus(Status.RTH, theme, { glow: true }),
      animation: '$flash 0.5s infinite',
      animationDirection: 'alternate',
    },

    'status-skipped': createStyleForStatus(Status.SKIPPED, theme, {
      glow: true,
    }),
    'status-success': createStyleForStatus(Status.SUCCESS, theme),
    'status-warning': createStyleForStatus(Status.WARNING, theme, {
      glow: true,
    }),
    'status-waiting': {
      ...createStyleForStatus(Status.WAITING, theme),
      animation: '$flash 0.5s infinite',
      animationDirection: 'alternate',
    },

    '@keyframes flash': {
      '0%, 49%': {
        opacity: 0.2,
      },
      '50%, 100%': {
        opacity: 1,
      },
    },

    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }),
  { name: 'StatusLight' }
);

/**
 * Small component resembling a multi-color status light that can be used to
 * represent the state of a single step in a multi-step process.
 */
const StatusLight = ({ inline, size, status, ...rest }) => {
  const classes = useStyles();

  return (
    <Box
      className={clsx(
        classes.root,
        inline && classes.inline,
        classes[`size-${size}`],
        classes[`status-${status}`]
      )}
      component={inline ? 'span' : 'div'}
      {...rest}
    />
  );
};

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
