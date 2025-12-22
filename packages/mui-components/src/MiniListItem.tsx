import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';

import MiniListItemIcon, {
  type MiniListItemIconProps,
} from './MiniListItemIcon.js';

export interface MiniListItemProps {
  gap?: string | number;
  icon?: React.ReactNode;
  iconPreset?: MiniListItemIconProps['preset'];
  inset?: string | number;
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
}

/**
 * Generic list item to be used in the "mini-lists" that appear in popup
 * tooltips, typically in the app header.
 */
const MiniListItem = ({
  gap = 1,
  icon,
  iconPreset,
  inset,
  primaryText,
  secondaryText,
}: MiniListItemProps) => (
  <ListItem disableGutters sx={inset ? { px: inset } : null}>
    {iconPreset ? <MiniListItemIcon preset={iconPreset} /> : icon}
    {secondaryText ? (
      <Box display='flex' flexDirection='row' flexGrow={1}>
        <Box flexGrow={1}>{primaryText}</Box>
        <Box color='text.secondary' ml={gap}>
          {secondaryText}
        </Box>
      </Box>
    ) : (
      primaryText
    )}
  </ListItem>
);

export default MiniListItem;
