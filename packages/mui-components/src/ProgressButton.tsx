import Button, { type ButtonProps } from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';

export type ProgressButtonProps = ButtonProps & {
  /** The progress to show, between 0% and 100% */
  progress?: number | null | undefined;
};

const progressBarStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: [0, 0, 2, 2],
} as const;

/**
 * Button that can indicate the progress of an operation by coloring its background or
 * showing a progress bar inside the button.
 */
const ProgressButton = ({
  children,
  progress,
  ...rest
}: ProgressButtonProps) => (
  <Button {...rest}>
    {children}
    {typeof progress === 'number' && (
      <LinearProgress
        value={progress}
        variant='determinate'
        sx={progressBarStyle}
      />
    )}
  </Button>
);

export default ProgressButton;
