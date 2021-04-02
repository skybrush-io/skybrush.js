import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import DraggableDialog from '@skybrush/mui-components/src/DraggableDialog';

import { isOutputDeviceDialogVisible } from '~/features/ui/selectors';
import { closeOutputDeviceDialog } from '~/features/ui/slice';

import OutputDeviceForm from './OutputDeviceForm';

const OutputDeviceDialog = ({ open, onClose }) => (
  <DraggableDialog
    title='Select output device'
    maxWidth='xs'
    open={open}
    onClose={onClose}
  >
    <DialogContent>
      <OutputDeviceForm />
    </DialogContent>
    <DialogActions>
      <Button>Connect</Button>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </DraggableDialog>
);

OutputDeviceDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default connect(
  // mapStateToProps
  (state) => ({
    open: isOutputDeviceDialogVisible(state),
  }),
  // mapDispatchToProps
  {
    onClose: closeOutputDeviceDialog,
  }
)(OutputDeviceDialog);
