import VolumeOff from '@mui/icons-material/VolumeOff';
import VolumeUp from '@mui/icons-material/VolumeUp';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';

export type MuteButtonProps = IconButtonProps & {
  muted: boolean;
};

/**
 * A button that is typically used to toggle the muted state of an audio source.
 */
const MuteButton = ({ muted, ...rest }: MuteButtonProps) => (
  <IconButton disableRipple size='large' {...rest}>
    {muted ? <VolumeOff /> : <VolumeUp />}
  </IconButton>
);

export default MuteButton;
