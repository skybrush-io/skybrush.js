import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import SettingsInputHdmi from '@material-ui/icons/SettingsInputHdmi';
import BackgroundHint from '@skybrush/mui-components/src/BackgroundHint';

import { requestSerialPortsAndShowOutputDeviceDialog } from '~/features/output/actions';

const NoOutputDeviceHint = ({ onShowOutputDeviceDialog }) => (
  <BackgroundHint
    header='Disconnected'
    text='You need to select an output device to communicate with the drones'
    icon={<SettingsInputHdmi />}
    button={
      <Button onClick={onShowOutputDeviceDialog}>Select output device</Button>
    }
  />
);

NoOutputDeviceHint.propTypes = {
  onShowOutputDeviceDialog: PropTypes.func,
};

export default connect(
  // mapStateToProps
  () => ({}),
  // mapDispatchToProps
  {
    onShowOutputDeviceDialog: requestSerialPortsAndShowOutputDeviceDialog,
  }
)(NoOutputDeviceHint);
