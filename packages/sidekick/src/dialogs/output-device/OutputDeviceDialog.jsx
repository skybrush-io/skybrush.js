import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import DraggableDialog from '@skybrush/mui-components/src/DraggableDialog';

import ConnectionStatusIndicator from '~/components/ConnectionStatusIndicator';
import { tryConnectToOutputDevice } from '~/features/output/actions';
import {
  getConnectionState,
  isConnectionInTransientState,
} from '~/features/output/selectors';
import { getPreferredOutputDevice } from '~/features/settings/selectors';
import { setPreferredOutputDevice } from '~/features/settings/slice';
import { isOutputDeviceDialogVisible } from '~/features/ui/selectors';
import { closeOutputDeviceDialog } from '~/features/ui/slice';

import OutputDeviceForm from './OutputDeviceForm';

const OutputConnectionStatusIndicator = connect(
  // mapStateToProps
  (state) => ({
    status: getConnectionState(state),
  }),
  // mapDispatchToProps
  {}
)(ConnectionStatusIndicator);

const OutputDeviceDialog = ({
  preferredOutputDevice,
  open,
  onClose,
  onSubmit,
  submissionPrevented,
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
      <OutputConnectionStatusIndicator pl={2} flex={1} />
      <Button
        disabled={submissionPrevented}
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
  submissionPrevented: PropTypes.bool,
};

export default connect(
  // mapStateToProps
  (state) => ({
    preferredOutputDevice: getPreferredOutputDevice(state),
    open: isOutputDeviceDialogVisible(state),
    submissionPrevented: isConnectionInTransientState(state),
  }),
  // mapDispatchToProps
  {
    onClose: closeOutputDeviceDialog,
    onSubmit: (...args) => async (dispatch) => {
      await tryConnectToOutputDevice(...args);
      dispatch(setPreferredOutputDevice(...args));
      dispatch(closeOutputDeviceDialog());
    },
  }
)(OutputDeviceDialog);
