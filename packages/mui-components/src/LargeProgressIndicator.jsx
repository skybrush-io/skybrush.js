import PropTypes from 'prop-types';
import React from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';

const LargeProgressIndicator = ({ fullHeight, label, visible, ...rest }) => (
  <Fade in={visible}>
    <Box
      alignItems='center'
      flex={1}
      padding={1}
      display='flex'
      flexDirection='column'
      justifyContent='center'
      height={fullHeight ? '100%' : null}
      {...rest}
    >
      <Box pb={2}>
        <CircularProgress color='secondary' />
      </Box>
      {label && (
        <Typography noWrap variant='body2' color='textSecondary'>
          {label}
        </Typography>
      )}
    </Box>
  </Fade>
);

LargeProgressIndicator.propTypes = {
  fullHeight: PropTypes.bool,
  label: PropTypes.string,
  visible: PropTypes.bool,
};

LargeProgressIndicator.defaultProps = {
  visible: true,
};

export default LargeProgressIndicator;
