import React from 'react';

import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import VolumeOff from '@mui/icons-material/VolumeOff';
import VolumeUp from '@mui/icons-material/VolumeUp';

/**
 * A button that is typically used to toggle the muted state of an audio source.
 */
const MuteButton = ({
  muted,
  ...rest
}: IconButtonProps & { muted: boolean }) => (
  <IconButton disableRipple size='large' {...rest}>
    {muted ? <VolumeOff /> : <VolumeUp />}
  </IconButton>
);

export default MuteButton;
