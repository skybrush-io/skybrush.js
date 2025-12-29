import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';

export type SmallProgressIndicatorProps = {
  label?: string;
  visible?: boolean;
};

const SmallProgressIndicator = ({
  label,
  visible = true,
  ...rest
}: SmallProgressIndicatorProps) => (
  <Fade in={visible}>
    <Box
      alignItems='center'
      flex={1}
      padding={1}
      display='flex'
      flexDirection='row'
      overflow='hidden'
      {...rest}
    >
      <Box pr={1}>
        <CircularProgress color='secondary' size={16} />
      </Box>
      <Typography noWrap variant='body2' color='textSecondary'>
        {label}
      </Typography>
    </Box>
  </Fade>
);

export default SmallProgressIndicator;
