import Box from '@mui/material/Box';
import Tabs, { type TabsProps } from '@mui/material/Tabs';

import DialogAppBar from './DialogAppBar.js';

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

export type DialogTabsProps = {
  alignment?: 'left' | 'center' | 'justify';
  dragHandle?: string;
  extraComponents?: React.ReactNode;
} & TabsProps;

/**
 * Tab component styled appropriately to be suitable for presentation in the
 * header of a dialog.
 */
const DialogTabs = ({
  alignment = 'justify',
  children,
  dragHandle,
  extraComponents,
  ...rest
}: DialogTabsProps) => (
  <DialogAppBar style={dragHandle ? { flexDirection: 'row' } : undefined}>
    <Tabs {...alignmentProps[dragHandle ? 'draggable' : alignment]} {...rest}>
      {children}
    </Tabs>
    {dragHandle && <Box id={dragHandle} sx={{ cursor: 'move', flex: 1 }} />}
    {extraComponents}
  </DialogAppBar>
);

export default DialogTabs;
