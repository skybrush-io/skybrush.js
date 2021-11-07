import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import Power from '@mui/icons-material/Power';
import { isThemeDark } from '@skybrush/app-theme-mui';
import BackgroundHint from '@skybrush/mui-components/src/BackgroundHint';

import { requestSerialPortsAndShowOutputDeviceDialog } from '~/features/output/actions';
import { hasConnectedOutputDevice } from '~/features/output/selectors';

const styles = {
  backdrop: {
    backdropFilter: 'blur(16px)',
    backgroundColor: (theme) =>
      isThemeDark(theme) ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    boxShadow: 'inset 0 16px 16px -16px rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: (theme) => theme.zIndex.drawer + 1,
    opacity: 0,
    pointerEvents: 'none',
    transition: (theme) =>
      theme.transitions.create(['opacity'], {
        duration: theme.transitions.duration.short,
      }),
  },
};

styles.backdropOpen = {
  ...styles.backdrop,
  opacity: 1,
  pointerEvents: 'auto',
};

const NoOutputDeviceBackdrop = ({ onShowOutputDeviceDialog, open }) => (
  <Box sx={open ? styles.backdropOpen : styles.backdrop}>
    <BackgroundHint
      header='No output device'
      text='Select an output device to communicate with the drones'
      icon={<Power />}
      button={
        <Button onClick={onShowOutputDeviceDialog}>Select output device</Button>
      }
    />
  </Box>
);

NoOutputDeviceBackdrop.propTypes = {
  onShowOutputDeviceDialog: PropTypes.func,
  open: PropTypes.bool,
};

export default connect(
  // mapStateToProps
  (state) => ({
    open: !hasConnectedOutputDevice(state),
  }),
  // mapDispatchToProps
  {
    onShowOutputDeviceDialog: requestSerialPortsAndShowOutputDeviceDialog,
  }
)(NoOutputDeviceBackdrop);
