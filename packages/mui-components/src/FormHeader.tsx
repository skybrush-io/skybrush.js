import * as React from 'react';

import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface FormHeaderProps extends BoxProps {
  disablePadding?: boolean;
}

const FormHeader = ({ children, disablePadding, ...rest }: FormHeaderProps) => (
  <Box color='text.secondary' mt={disablePadding ? 0 : 2} mb={0.5} {...rest}>
    <Typography variant='button' component='span'>
      {children}
    </Typography>
  </Box>
);

export default FormHeader;
