import PropTypes from 'prop-types';
import React from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';

const SmallProgressIndicator = ({ label, visible, ...rest }) => (
  <Fade in={visible}>
    <Box
      alignItems='center'
      flex={1}
      padding={1}
      display='flex'
      flexDirection='row'
      overflow='hidden'
      {...rest}
    >
      <Box pr={1}>
        <CircularProgress color='secondary' size={16} />
      </Box>
      <Typography noWrap variant='body2' color='textSecondary'>
        {label}
      </Typography>
    </Box>
  </Fade>
);

SmallProgressIndicator.propTypes = {
  label: PropTypes.string,
  visible: PropTypes.bool,
};

SmallProgressIndicator.defaultProps = {
  visible: true,
};

export default SmallProgressIndicator;
