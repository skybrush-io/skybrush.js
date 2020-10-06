import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { isThemeDark } from '@skybrush/app-theme-material-ui';

import WindowDragHandle from '../components/WindowDragHandle';
import { MasterSwitch } from '../features/rc/components';
import { isRunningOnMac } from '../utils';

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: 'center',
    backgroundColor: isThemeDark(theme)
      ? 'rgba(0, 0, 0, 0.54)'
      : 'rgb(240, 240, 240)',
    boxShadow: '0 -2px 4px inset rgba(0, 0, 0, 0.2)',
    display: 'flex',
    height: 36,
    padding: theme.spacing(1, 2),
    position: 'relative',
  },
}));

const Header = () => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      {isRunningOnMac && <WindowDragHandle />}
      <Box flex={1} />
      <MasterSwitch />
    </Box>
  );
};

Header.propTypes = {};

export default Header;
