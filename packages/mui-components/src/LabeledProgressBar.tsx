import LinearProgress, {
  type LinearProgressProps,
} from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type LabeledProgressBarProps = LinearProgressProps & {
  /** Label to show next to the progress bar. */
  label: ReactNode;

  /** Whether to skip wrapping the label in a Typography component. */
  disableTypography?: boolean;

  /** Alignment of the label. Has no effect on block-level labels when
   * `disableTypography` is enabled; such labels control their own alignment. */
  textAlign?: 'left' | 'right' | 'center';

  /** Placement of the label relative to the progress bar. */
  labelPlacement?: 'above' | 'below';
};

/**
 * Progress bar with a label above or below it.
 */
const LabeledProgressBar = ({
  label,
  disableTypography = false,
  textAlign = 'left',
  labelPlacement = 'above',
  ...rest
}: LabeledProgressBarProps) => {
  const labelElement = disableTypography ? (
    label
  ) : (
    <Typography variant='body2'>{label}</Typography>
  );

  return (
    // The alignment is set on the stack so that it also applies to labels
    // that are not wrapped in a Typography component.
    <Stack spacing={1} sx={{ textAlign, width: '100%' }}>
      {labelPlacement === 'above' ? labelElement : null}
      <LinearProgress {...rest} />
      {labelPlacement === 'below' ? labelElement : null}
    </Stack>
  );
};

export default LabeledProgressBar;
