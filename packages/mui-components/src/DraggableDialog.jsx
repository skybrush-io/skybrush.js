import PropTypes from 'prop-types';
import React from 'react';
import Draggable from 'react-draggable';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import { createSecondaryAreaStyle } from '@skybrush/app-theme-mui';

import DialogToolbar from './DialogToolbar';

const DraggablePaper = (props) => (
  <Draggable
    handle='#draggable-dialog-title'
    cancel={'[class*="MuiDialogContent-root"]'}
  >
    <Paper {...props} />
  </Draggable>
);

const styles = {
  draggableTitle: {
    flex: 1,
    cursor: 'move',
  },
};

const DraggableDialogSidebar = styled('div')(({ theme }) =>
  createSecondaryAreaStyle(theme, { inset: 'right' })
);

const DraggableDialog = ({
  children,
  sidebarComponents,
  title,
  titleComponents,
  toolbarComponent,
  ...rest
}) => {
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

DraggableDialog.propTypes = {
  sidebarComponents: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  title: PropTypes.string,
  titleComponents: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  toolbarComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
};

export default DraggableDialog;
