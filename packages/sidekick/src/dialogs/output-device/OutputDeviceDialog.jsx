import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import DraggableDialog from '@skybrush/mui-components/src/DraggableDialog';

import { tryConnectToOutputDevice } from '~/features/output/actions';
import { getPreferredOutputDevice } from '~/features/settings/selectors';
import { isOutputDeviceDialogVisible } from '~/features/ui/selectors';
import { closeOutputDeviceDialog } from '~/features/ui/slice';

import OutputDeviceForm from './OutputDeviceForm';

const OutputDeviceDialog = ({
  preferredOutputDevice,
  open,
  onClose,
  onSubmit,
}) => (
  <DraggableDialog
    fullWidth
    title='Select output device'
    maxWidth='xs'
    open={open}
    onClose={onClose}
  >
    <DialogContent>
      <OutputDeviceForm
        initialValues={preferredOutputDevice}
        onSubmit={onSubmit}
      />
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          document
            .querySelector('#output-device-form')
            .dispatchEvent(
              new Event('submit', { bubbles: true, cancelable: true })
            );
        }}
      >
        Connect
      </Button>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </DraggableDialog>
);

OutputDeviceDialog.propTypes = {
  preferredOutputDevice: PropTypes.shape({
    serialPort: PropTypes.string,
    baudRate: PropTypes.number,
  }),
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default connect(
  // mapStateToProps
  (state) => ({
    preferredOutputDevice: getPreferredOutputDevice(state),
    open: isOutputDeviceDialogVisible(state),
  }),
  // mapDispatchToProps
  {
    onClose: closeOutputDeviceDialog,
    onSubmit: tryConnectToOutputDevice,
  }
)(OutputDeviceDialog);
