import * as React from 'react';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';

import MiniListItemIcon, {
  type MiniListItemIconProps,
} from './MiniListItemIcon';

interface MiniListItemProps {
  icon?: React.ReactNode;
  iconPreset?: MiniListItemIconProps['preset'];
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
}

/**
 * Generic list item to be used in the "mini-lists" that appear in popup
 * tooltips, typically in the app header.
 */
const MiniListItem = ({
  icon,
  iconPreset,
  primaryText,
  secondaryText,
}: MiniListItemProps) => (
  <ListItem disableGutters>
    {iconPreset ? <MiniListItemIcon preset={iconPreset} /> : icon}
    {secondaryText ? (
      <Box display='flex' flexDirection='row' flexGrow={1}>
        <Box flexGrow={1}>{primaryText}</Box>
        <Box color='text.secondary' ml={1}>
          {secondaryText}
        </Box>
      </Box>
    ) : (
      primaryText
    )}
  </ListItem>
);

export default MiniListItem;
