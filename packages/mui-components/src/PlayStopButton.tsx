import React from 'react';

import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Pause from '@mui/icons-material/Pause';
import Play from '@mui/icons-material/PlayArrow';

export type PlayStopButtonProps = IconButtonProps & {
  /**
   * Whether the button should show the "playing" (pause) icon or the "stopped" (play) icon.
   */
  playing: boolean;
};

/**
 * A combined play/stop button that can be used next to playback sliders.
 */
const PlayStopButton = ({ playing, ...rest }: PlayStopButtonProps) => (
  <IconButton disableRipple size='large' {...rest}>
    {playing ? <Pause /> : <Play />}
  </IconButton>
);

export default PlayStopButton;
