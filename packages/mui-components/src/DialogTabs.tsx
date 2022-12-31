import * as React from 'react';

import Box from '@mui/material/Box';
import Tabs, { type TabsProps } from '@mui/material/Tabs';

import DialogAppBar from './DialogAppBar';

const alignmentProps: Record<string, TabsProps> = {
  left: {},
  center: { centered: true },
  right: {},
  justify: {
    centered: true,
    variant: 'fullWidth',
  },
  draggable: {},
};

export interface DialogTabsProps extends TabsProps {
  alignment: 'left' | 'center' | 'justify';
  dragHandle?: string;
}

/**
 * Tab component styled appropriately to be suitable for presentation in the
 * header of a dialog.
 */
const DialogTabs = ({
  alignment = 'justify',
  children,
  dragHandle,
  ...rest
}: DialogTabsProps) => (
  <DialogAppBar style={dragHandle ? { flexDirection: 'row' } : undefined}>
    <Tabs {...alignmentProps[dragHandle ? 'draggable' : alignment]} {...rest}>
      {children}
    </Tabs>
    {dragHandle && <Box flex={1} id={dragHandle} style={{ cursor: 'move' }} />}
  </DialogAppBar>
);

export default DialogTabs;
