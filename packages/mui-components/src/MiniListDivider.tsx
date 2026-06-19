import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

/**
 * Divider that fits nicely in a mini list.
 */
const MiniListDivider = () => (
  <Box sx={{ mx: -1, my: 1 }}>
    <Divider />
  </Box>
);

export default MiniListDivider;
