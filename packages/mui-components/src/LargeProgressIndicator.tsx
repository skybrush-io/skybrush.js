import Box, { type BoxProps } from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';

export interface LargeProgressIndicatorProps extends BoxProps {
  fullHeight?: boolean;
  label?: string;
  visible?: boolean;
}

const LargeProgressIndicator = ({
  fullHeight,
  label,
  visible = true,
  ...rest
}: LargeProgressIndicatorProps) => (
  <Fade in={visible}>
    <Box
      alignItems='center'
      flex={1}
      padding={1}
      display='flex'
      flexDirection='column'
      justifyContent='center'
      height={fullHeight ? '100%' : undefined}
      {...rest}
    >
      <Box pb={2}>
        <CircularProgress color='secondary' />
      </Box>
      {label && (
        <Typography noWrap variant='body2' color='textSecondary'>
          {label}
        </Typography>
      )}
    </Box>
  </Fade>
);

export default LargeProgressIndicator;
