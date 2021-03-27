import React from 'react';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import PreferencesButton from './PreferencesButton';

const useStyles = makeStyles({
  root: {
    backgroundColor: '#333',
    display: 'flex',
    flexFlow: 'row nowrap',
    flexGrow: 0,
    minHeight: 48,
    overflow: 'hidden',
  },
});

const Header = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box flex={1} />
      <PreferencesButton />
    </Box>
  );
};

export default Header;
