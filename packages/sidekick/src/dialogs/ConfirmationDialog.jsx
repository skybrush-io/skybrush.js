import React from 'react';
import Markdown from 'react-markdown';
import { connect, useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { confirm, reject } from '~/features/confirmation/actions';
import {
  getConfirmationMessage,
  getConfirmationTitle,
  hasPendingConfirmation,
} from '~/features/confirmation/selectors';

const ConfirmationDialogBody = () => {
  const dispatch = useDispatch();
  const message = useSelector(getConfirmationMessage);
  const title = useSelector(getConfirmationTitle);

  let dialogContent = <DialogContentText>{message}</DialogContentText>;

  if (typeof message === 'object') {
    const { format, text } = message;
    if (format === 'markdown') {
      dialogContent = (
        <Box color='text.secondary' fontSize='body1.fontSize' my={-2}>
          <Markdown>{text}</Markdown>
        </Box>
      );
    }
  }

  return (
    <>
      {title && title.length > 0 && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{dialogContent}</DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(reject())}>Cancel</Button>
        <Button autoFocus onClick={() => dispatch(confirm())}>
          Confirm
        </Button>
      </DialogActions>
    </>
  );
};

const ConfirmationDialog = (props) => (
  <Dialog {...props}>
    <ConfirmationDialogBody />
  </Dialog>
);

export default connect(
  // mapStateToProps
  (state) => ({
    open: hasPendingConfirmation(state),
  }),
  // mapDispatchToProps
  {
    onClose: reject,
  }
)(ConfirmationDialog);
