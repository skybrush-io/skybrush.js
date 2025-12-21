import React from 'react';

import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';

import StatusLight, { type StatusLightProps } from './StatusLight.js';

export interface LabeledStatusLightProps extends StatusLightProps {
  children: React.ReactNode;
  color?: TypographyProps['color'];
}

const LabeledStatusLight = ({
  children,
  color = 'textPrimary',
  size = 'normal',
  status,
  ...rest
}: LabeledStatusLightProps) => (
  <Box
    alignItems='center'
    flex={1}
    display='flex'
    flexDirection='row'
    {...rest}
  >
    <StatusLight inline size={size} status={status} />
    <Box pl={1}>
      <Typography
        noWrap
        variant={size === 'small' ? 'body2' : 'body1'}
        color={color}
      >
        {children}
      </Typography>
    </Box>
  </Box>
);

export default LabeledStatusLight;
