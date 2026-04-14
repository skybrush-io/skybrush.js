import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';

import { makeStyles } from '@skybrush/app-theme-mui';
import type { MiniListItemProps } from './MiniListItem.js';
import MiniListItemIcon from './MiniListItemIcon.js';

const useStyles = makeStyles({
  listItemHoverStyle: {
    '& .MiniListItemSecondaryActions-root': {
      display: 'none',
    },
    '&:hover .MiniListItemSecondaryActions-root': {
      display: 'inline-flex',
    },
  },
});

export type MiniListItemButtonProps = MiniListItemProps & {
  disabled?: boolean;
  onClick?: () => void;
};

/**
 * Generic list item to be used in the "mini-lists" that appear in popup
 * tooltips, typically in the app header.
 */
const MiniListItemButton = ({
  disabled = false,
  gap = 1,
  icon,
  iconPreset,
  inset,
  primaryText,
  secondaryActions,
  secondaryText,
  showSecondaryActionsOnHoverOnly,
  onClick,
}: MiniListItemButtonProps) => {
  const classes = useStyles();
  return (
    <ListItemButton
      className={
        showSecondaryActionsOnHoverOnly ? classes.listItemHoverStyle : undefined
      }
      disabled={disabled}
      disableGutters
      sx={inset ? { px: inset } : undefined}
      onClick={onClick}
    >
      {iconPreset ? <MiniListItemIcon pad='right' preset={iconPreset} /> : icon}
      {secondaryText ? (
        <Box display='flex' flexDirection='row' flexGrow={1}>
          <Box flexGrow={1}>{primaryText}</Box>
          <Box color='text.secondary' ml={gap}>
            {secondaryText}
          </Box>
        </Box>
      ) : secondaryActions ? (
        <Box flexGrow={1}>{primaryText}</Box>
      ) : (
        primaryText
      )}
      <Box className='MiniListItemSecondaryActions-root'>
        {secondaryActions}
      </Box>
    </ListItemButton>
  );
};

export default MiniListItemButton;
