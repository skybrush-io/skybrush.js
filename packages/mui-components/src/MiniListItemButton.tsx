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
  gap = 1,
  icon,
  iconPreset,
  inset,
  primaryText,
  secondaryText,
  onClick,
}: MiniListItemButtonProps) => (
  <ListItemButton
    disableGutters
    sx={inset ? { px: inset } : undefined}
    onClick={onClick}
  >
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
  </ListItemButton>
);

export default MiniListItemButton;
