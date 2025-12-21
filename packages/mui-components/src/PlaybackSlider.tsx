import Slider, { type SliderProps } from '@mui/material/Slider';
import { orange } from '@mui/material/colors';
import { styled, type Theme } from '@mui/material/styles';
import { useRerender } from '@react-hookz/web';

import useHarmonicIntervalFn from './hooks/useHarmonicIntervalFn.js';

const styles = ({ theme }: { theme: Theme }) => ({
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: theme.palette.primary.main,
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },

  '& .MuiSlider-mark': {
    height: 4,
    width: 4,
    backgroundColor: orange[500],
    transform: 'translateY(-1px)',
    '&.MuiSlider-markActive': {
      opacity: 1,
    },
  },
});

export type PlaybackSliderProps = SliderProps & {
  dragging: boolean;
  duration: number;
  formatPlaybackTimestamp: (timestamp: number) => string;
  getElapsedSeconds: () => number;
  onDragged: SliderProps['onChangeCommitted'];
  onDragging: SliderProps['onChange'];
  playing: boolean;
  updateInterval?: number;
};

const PlaybackSlider = ({
  dragging,
  duration,
  formatPlaybackTimestamp,
  getElapsedSeconds,
  onDragged,
  onDragging,
  playing,
  updateInterval = 200,
  ...rest
}: PlaybackSliderProps) => {
  const update = useRerender();
  useHarmonicIntervalFn(update, playing && !dragging ? updateInterval : null);

  const elapsed = Math.min(getElapsedSeconds(), duration);

  return (
    <Slider
      max={duration}
      size='small'
      value={elapsed}
      valueLabelDisplay='auto'
      valueLabelFormat={formatPlaybackTimestamp}
      onChange={onDragging}
      onChangeCommitted={onDragged}
      {...rest}
    />
  );
};

export default styled(PlaybackSlider)(styles);
