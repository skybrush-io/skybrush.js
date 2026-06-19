import Box, { type BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type FormHeaderProps = {
  disablePadding?: boolean;
} & BoxProps;

const FormHeader = ({
  children,
  disablePadding,
  sx,
  ...rest
}: FormHeaderProps) => (
  <Box
    sx={{
      color: 'text.secondary',
      mt: disablePadding ? 0 : 2,
      mb: 0.5,
      ...sx,
    }}
    {...rest}
  >
    <Typography variant='button' component='span'>
      {children}
    </Typography>
  </Box>
);

export default FormHeader;
