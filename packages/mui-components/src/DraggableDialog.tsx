import React from 'react';
import Draggable from 'react-draggable';

import Box from '@mui/material/Box';
import Dialog, { type DialogProps } from '@mui/material/Dialog';
import Paper, { type PaperProps } from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import { createSecondaryAreaStyle } from '@skybrush/app-theme-mui';

import DialogToolbar from './DialogToolbar.js';

const DraggablePaper = (props: PaperProps) => {
  const ref = React.useRef(null);
  return (
    <Draggable
      handle='#draggable-dialog-title'
      cancel={'[class*="MuiDialogContent-root"]'}
      nodeRef={ref}
    >
      <Paper ref={ref} {...props} />
    </Draggable>
  );
};

const styles = {
  draggableTitle: {
    flex: 1,
    cursor: 'move',
  },
} as const;

const DraggableDialogSidebar = styled('div')(({ theme }) =>
  createSecondaryAreaStyle(theme, { inset: 'right' })
);

export interface DraggableDialogProps extends DialogProps {
  sidebarComponents?: React.ReactNode;
  titleComponents?: React.ReactNode;
  toolbarComponent?: ((id: string) => React.ReactNode) | React.ReactNode;
}

const DraggableDialog = ({
  children,
  sidebarComponents,
  title,
  titleComponents,
  toolbarComponent,
  ...rest
}: DraggableDialogProps) => {
  const titleTypography = (
    <Typography noWrap variant='subtitle1'>
      {title}
    </Typography>
  );

  const dialogBody = toolbarComponent ? (
    <>
      {typeof toolbarComponent === 'function'
        ? toolbarComponent('draggable-dialog-title')
        : toolbarComponent}
      {children}
    </>
  ) : (
    <>
      {titleComponents ? (
        <DialogToolbar>
          <Box sx={styles.draggableTitle} id='draggable-dialog-title'>
            {titleTypography}
          </Box>
          {titleComponents}
        </DialogToolbar>
      ) : (
        <DialogToolbar sx={styles.draggableTitle} id='draggable-dialog-title'>
          {titleTypography}
        </DialogToolbar>
      )}
      {children}
    </>
  );

  return (
    <Dialog PaperComponent={DraggablePaper} {...rest}>
      {sidebarComponents ? (
        <Box display='flex' flexDirection='row' alignItems='stretch'>
          <DraggableDialogSidebar>{sidebarComponents}</DraggableDialogSidebar>
          <Box flex={1} overflow='auto'>
            {dialogBody}
          </Box>
        </Box>
      ) : (
        dialogBody
      )}
    </Dialog>
  );
};

export default DraggableDialog;
