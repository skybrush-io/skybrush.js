import * as React from 'react';

import AppBar, { AppBarProps } from '@mui/material/AppBar';
import { Theme } from '@mui/material';

import { isThemeDark } from '@skybrush/app-theme-mui';

const style = {
  background: (theme: Theme) => (isThemeDark(theme) ? '#535353' : undefined),
  color: (theme: Theme) =>
    isThemeDark(theme) ? theme.palette.getContrastText('#535353') : undefined,
} as const;

export type DialogAppBarProps = AppBarProps;

/**
 * App bar styled appropriately to be suitable for presentation in the
 * header of a dialog.
 */
const DialogAppBar = ({ children, ...rest }: DialogAppBarProps) => (
  <AppBar position='static' color='primary' sx={style} {...rest}>
    {children}
  </AppBar>
);

export default DialogAppBar;
