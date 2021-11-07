import PropTypes from 'prop-types';
import React from 'react';

import AppBar from '@mui/material/AppBar';

import { isThemeDark } from './utils';

const style = {
  background: (theme) => (isThemeDark(theme) ? '#535353' : undefined),
  color: (theme) =>
    isThemeDark(theme) ? theme.palette.getContrastText('#535353') : undefined,
};

/**
 * App bar styled appropriately to be suitable for presentation in the
 * header of a dialog.
 */
const DialogAppBar = ({ children, ...rest }) => (
  <AppBar position='static' color='primary' sx={style} {...rest}>
    {children}
  </AppBar>
);

DialogAppBar.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default DialogAppBar;
