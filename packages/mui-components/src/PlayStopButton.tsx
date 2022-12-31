import React from 'react';

import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Pause from '@mui/icons-material/Pause';
import Play from '@mui/icons-material/PlayArrow';

/**
 * A combined play/stop button that can be used next to playback sliders.
 */
const PlayStopButton = ({
  playing,
  ...rest
}: IconButtonProps & { playing: boolean }) => (
  <IconButton disableRipple size='large' {...rest}>
    {playing ? <Pause /> : <Play />}
  </IconButton>
);

export default PlayStopButton;
