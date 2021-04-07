import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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

  return (
    <>
      {title && title.length > 0 && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(reject())}>Cancel</Button>
        <Button autoFocus color='primary' onClick={() => dispatch(confirm())}>
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
