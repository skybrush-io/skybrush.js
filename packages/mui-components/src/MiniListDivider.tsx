import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

type Props = {
  inset?: number;
};

/**
 * Divider that fits nicely in a mini list.
 */
const MiniListDivider = ({ inset = 0 }: Props) => (
  <Box sx={{ mx: inset - 1, my: 1 }}>
    <Divider />
  </Box>
);

export default MiniListDivider;
