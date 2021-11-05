import Box from '@mui/material/Box';
import React from 'react';

import { isThemeDark } from '@skybrush/app-theme-mui';

import SkybrushLogo from '../components/SkybrushLogo';

const style = {
  alignItems: 'stretch',
  backgroundColor: (theme) =>
    isThemeDark(theme) ? 'rgba(0, 0, 0, 0.54)' : 'rgb(240, 240, 240)',
  boxShadow: '0 2px 4px inset rgba(0, 0, 0, 0.2)',
  display: 'flex',
  flexDirection: 'row',
  height: 48,
};

const Footer = () => (
  <Box sx={style}>
    <SkybrushLogo width={120} flex={1} px={2} py={1} />
  </Box>
);

export default Footer;
