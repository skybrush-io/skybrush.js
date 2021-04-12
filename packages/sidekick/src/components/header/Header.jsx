import React from 'react';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import PreferencesButton from './PreferencesButton';
import RTKStatusHeaderButton from './RTKStatusHeaderButton';
import SerialPortHeaderButton from './SerialPortHeaderButton';
import ServerHeaderButton from './ServerHeaderButton';

const useStyles = makeStyles({
  root: {
    backgroundColor: '#333',
    display: 'flex',
    flexFlow: 'row nowrap',
    flexGrow: 0,
    minHeight: 48,
    overflow: 'hidden',

    '& > hr': {
      alignSelf: 'stretch',
      width: 1,
      margin: '0 0.25em',
      border: 'none',
      background: '#444',
      boxShadow: '-1px 0 4px rgba(0, 0, 0, 0.65)',
    },
  },
});

const Header = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <SerialPortHeaderButton />
      <hr />
      <ServerHeaderButton />
      <hr />
      <RTKStatusHeaderButton />
      <hr />
      <Box flex={1} />
      <hr />
      <PreferencesButton />
    </Box>
  );
};

export default Header;
