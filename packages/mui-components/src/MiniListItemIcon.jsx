import PropTypes from 'prop-types';
import React from 'react';

import { colorForStatus, Status } from '@skybrush/app-theme-mui';

import ListItemIcon from '@mui/material/ListItemIcon';
import ActionDone from '@mui/icons-material/Done';
import ActionSettingsEthernet from '@mui/icons-material/SettingsEthernet';
import ContentClear from '@mui/icons-material/Clear';
import PriorityHigh from '@mui/icons-material/PriorityHigh';

const presets = {
  connected: {
    color: colorForStatus(Status.SUCCESS),
    icon: <ActionDone fontSize='small' />,
  },

  connecting: {
    color: colorForStatus(Status.WARNING),
    icon: <ActionSettingsEthernet fontSize='small' />,
  },

  disconnected: {
    color: colorForStatus(Status.ERROR),
    icon: <ContentClear fontSize='small' />,
  },

  disconnecting: {
    color: colorForStatus(Status.WARNING),
    icon: <ActionSettingsEthernet fontSize='small' />,
  },

  empty: {},

  success: {
    color: colorForStatus(Status.SUCCESS),
    icon: <ActionDone fontSize='small' />,
  },

  warning: {
    color: colorForStatus(Status.WARNING),
    icon: <PriorityHigh fontSize='small' />,
  },
};

/**
 * Small icon to be used on the left edge of a mini list.
 */
const MiniListItemIcon = ({ color, children, preset, style, ...rest }) => {
  if (preset) {
    const { icon, color: presetColor } = presets[preset] || {};

    if (!children) {
      children = icon;
    }

    if (!color) {
      color = presetColor;
    }
  }

  const effectiveStyle = {
    color,
    minWidth: 28,
    ...style,
  };

  return (
    <ListItemIcon style={effectiveStyle} {...rest}>
      {children}
    </ListItemIcon>
  );
};

MiniListItemIcon.presets = presets;

MiniListItemIcon.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  color: PropTypes.string,
  preset: PropTypes.oneOf(Object.keys(presets)),
  style: PropTypes.object,
};

export default MiniListItemIcon;
