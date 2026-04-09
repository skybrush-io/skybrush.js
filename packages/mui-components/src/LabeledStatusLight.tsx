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
    <Typography
      noWrap
      variant={size === 'small' ? 'body2' : 'body1'}
      color={color}
    >
      {children}
    </Typography>
  );

  return (
    <Box
      alignItems='center'
      flex={1}
      display='flex'
      flexDirection='row'
      {...rest}
    >
      {reversed ? <Box pr={1}>{label}</Box> : light}
      {reversed ? light : <Box pl={1}>{label}</Box>}
    </Box>
  );
};

export default LabeledStatusLight;
