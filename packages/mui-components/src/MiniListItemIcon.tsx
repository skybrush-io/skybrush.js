import type React from 'react';

import { colorForStatus, Status } from '@skybrush/app-theme-mui';

import Add from '@mui/icons-material/Add';
import ContentClear from '@mui/icons-material/Clear';
import Delete from '@mui/icons-material/Delete';
import ActionDone from '@mui/icons-material/Done';
import Number3 from '@mui/icons-material/Looks3';
import Number4 from '@mui/icons-material/Looks4';
import Number5 from '@mui/icons-material/Looks5';
import Number6 from '@mui/icons-material/Looks6';
import Number1 from '@mui/icons-material/LooksOne';
import Number2 from '@mui/icons-material/LooksTwo';
import PriorityHigh from '@mui/icons-material/PriorityHigh';
import Refresh from '@mui/icons-material/Refresh';
import ActionSettingsEthernet from '@mui/icons-material/SettingsEthernet';
import ListItemIcon, {
  type ListItemIconProps,
} from '@mui/material/ListItemIcon';

const presets: Record<string, { color?: string; icon?: React.ReactNode }> = {
  add: {
    color: colorForStatus(Status.SUCCESS),
    icon: <Add fontSize='small' />,
  },

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

  delete: {
    color: colorForStatus(Status.ERROR),
    icon: <Delete fontSize='small' />,
  },

  empty: {},

  error: {
    color: colorForStatus(Status.ERROR),
    icon: <ContentClear fontSize='small' />,
  },

  number1: {
    icon: <Number1 fontSize='small' />,
  },

  number2: {
    icon: <Number2 fontSize='small' />,
  },

  number3: {
    icon: <Number3 fontSize='small' />,
  },

  number4: {
    icon: <Number4 fontSize='small' />,
  },

  number5: {
    icon: <Number5 fontSize='small' />,
  },

  number6: {
    icon: <Number6 fontSize='small' />,
  },

  success: {
    color: colorForStatus(Status.SUCCESS),
    icon: <ActionDone fontSize='small' />,
  },

  update: {
    color: colorForStatus(Status.INFO),
    icon: <Refresh fontSize='small' />,
  },

  warning: {
    color: colorForStatus(Status.WARNING),
    icon: <PriorityHigh fontSize='small' />,
  },
};

export type MiniListItemIconProps = {
  color?: string;
  pad?: 'left' | 'right' | 'both' | false;
  preset?: keyof typeof presets;
} & ListItemIconProps;

/**
 * Small icon to be used on the left edge of a mini list.
 */
const MiniListItemIcon = ({
  color,
  children,
  pad,
  preset,
  style,
  ...rest
}: MiniListItemIconProps) => {
  if (preset) {
    const { icon, color: presetColor } = presets[preset] || {};

    if (!children) {
      children = icon;
    }

    if (!color) {
      color = presetColor;
    }
  }

  let minWidth = 20; // base size of icon
  if (pad === 'left' || pad === 'right') {
    minWidth += 4; // gap between icon and text
  } else if (pad === 'both') {
    minWidth += 8; // gap on both sides
  }

  const effectiveStyle = {
    color,
    minWidth,
    ...style,
  };

  if (pad === 'left' || pad === 'both') {
    effectiveStyle.paddingLeft = 4;
  }

  return (
    <ListItemIcon style={effectiveStyle} {...rest}>
      {children}
    </ListItemIcon>
  );
};

MiniListItemIcon.presets = presets;

export default MiniListItemIcon;
