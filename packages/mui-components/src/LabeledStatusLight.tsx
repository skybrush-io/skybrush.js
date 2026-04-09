import type React from 'react';

import Box, { type BoxProps } from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';

import StatusLight, { type StatusLightProps } from './StatusLight.js';

export type LabeledStatusLightProps = Pick<
  StatusLightProps,
  'size' | 'status'
> &
  BoxProps & {
    children: React.ReactNode;
    color?: TypographyProps['color'];
    reversed?: boolean;
  };

const LabeledStatusLight = ({
  children,
  color = 'textPrimary',
  reversed = false,
  size = 'normal',
  status,
  ...rest
}: LabeledStatusLightProps) => {
  const light = <StatusLight inline size={size} status={status} />;
  const label = (
    <Box pl={1}>
      <Typography
        noWrap
        variant={size === 'small' ? 'body2' : 'body1'}
        color={color}
      >
        {children}
      </Typography>
    </Box>
  );

  return (
    <Box
      alignItems='center'
      flex={1}
      display='flex'
      flexDirection='row'
      {...rest}
    >
      {reversed ? label : light}
      {reversed ? light : label}
    </Box>
  );
};

export default LabeledStatusLight;
