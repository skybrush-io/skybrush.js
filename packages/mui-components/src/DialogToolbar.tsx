import * as React from 'react';

import Toolbar, { type ToolbarProps } from '@mui/material/Toolbar';

import DialogAppBar from './DialogAppBar';

export type DialogToolbarProps = ToolbarProps;

/**
 * toolbar component styled appropriately to be suitable for presentation in the
 * header of a dialog.
 */
const DialogToolbar = ({ children, ...rest }: ToolbarProps) => (
  <DialogAppBar>
    <Toolbar variant='dense' {...rest}>
      {children}
    </Toolbar>
  </DialogAppBar>
);

export default DialogToolbar;
