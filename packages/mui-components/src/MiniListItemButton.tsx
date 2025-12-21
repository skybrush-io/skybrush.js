import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';

import type { MiniListItemProps } from './MiniListItem.js';
import MiniListItemIcon from './MiniListItemIcon.js';

export type MiniListItemButtonProps = MiniListItemProps & {
  onClick?: () => void;
};

/**
 * Generic list item to be used in the "mini-lists" that appear in popup
 * tooltips, typically in the app header.
 */
const MiniListItemButton = ({
  icon,
  iconPreset,
  primaryText,
  secondaryText,
  onClick,
}: MiniListItemButtonProps) => (
  <ListItemButton disableGutters onClick={onClick}>
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
  </ListItemButton>
);

export default MiniListItemButton;
