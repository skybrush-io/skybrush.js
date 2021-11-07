import React from 'react';

import Box from '@mui/material/Box';

import PreferencesButton from './PreferencesButton';
import RTKStatusHeaderButton from './RTKStatusHeaderButton';
import SerialPortHeaderButton from './SerialPortHeaderButton';
import ServerHeaderButton from './ServerHeaderButton';

const style = {
  backgroundColor: '#333',
  display: 'flex',
  flexFlow: 'row nowrap',
  flexGrow: 0,
  fontSize: 'fontSize',
  minHeight: 48,
  overflow: 'hidden',

  '& > hr': {
    alignSelf: 'stretch',
    width: '1px',
    margin: '0 0.25em',
    border: 'none',
    background: '#444',
    boxShadow: '-1px 0 4px rgba(0, 0, 0, 0.65)',
  },
};

const Header = () => (
  <Box sx={style}>
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

export default Header;
