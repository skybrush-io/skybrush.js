import Box from '@mui/material/Box';
import React from 'react';

import { isThemeDark } from '@skybrush/app-theme-mui';

import WindowDragHandle from '../components/WindowDragHandle';
import { MainSwitch } from '../features/rc/components';
import { isRunningOnMac } from '../utils';

const style = {
  alignItems: 'center',
  backgroundColor: (theme) =>
    isThemeDark(theme) ? 'rgba(0, 0, 0, 0.54)' : 'rgb(240, 240, 240)',
  boxShadow: '0 -2px 4px inset rgba(0, 0, 0, 0.2)',
  display: 'flex',
  height: 36,
  px: 2,
  py: 1,
  position: 'relative',
};

const Header = () => (
  <Box sx={style}>
    {isRunningOnMac && <WindowDragHandle />}
    <Box flex={1} />
    <MainSwitch sx={{ transform: 'translateY(1px)' }} />
  </Box>
);

Header.propTypes = {};

export default Header;
