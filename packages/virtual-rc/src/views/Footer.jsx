import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { isThemeDark } from '@skybrush/app-theme-material-ui';

import SkybrushLogo from '../components/SkybrushLogo';

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: 'stretch',
    backgroundColor: isThemeDark(theme)
      ? 'rgba(0, 0, 0, 0.54)'
      : 'rgb(240, 240, 240)',
    boxShadow: '0 2px 4px inset rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'row',
    height: 48,
  },
}));

const Footer = () => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <SkybrushLogo width={120} flex={1} px={2} py={1} />
    </Box>
  );
};

export default Footer;
