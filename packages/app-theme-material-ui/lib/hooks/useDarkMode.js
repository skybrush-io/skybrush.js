import useMediaQuery from '@material-ui/core/useMediaQuery';

/**
 * React hook that returns whether the OS is currently set to dark mode.
 */
const useDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');

export default useDarkMode;
