import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';

import { makeStyles } from '@skybrush/app-theme-mui';
import MiniListItemIcon, {
  type MiniListItemIconProps,
} from './MiniListItemIcon.js';

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

export type MiniListItemProps = {
  gap?: string | number;
  icon?: React.ReactNode;
  iconPreset?: MiniListItemIconProps['preset'];
  inset?: string | number;
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  showSecondaryActionsOnHoverOnly?: boolean;
};

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
  secondaryActions,
  secondaryText,
  showSecondaryActionsOnHoverOnly,
}: MiniListItemProps) => {
  const classes = useStyles();
  return (
    <ListItem
      className={
        showSecondaryActionsOnHoverOnly ? classes.listItemHoverStyle : undefined
      }
      disableGutters
      sx={inset ? { px: inset } : null}
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
      {secondaryActions}
    </ListItem>
  );
};

export default MiniListItem;
