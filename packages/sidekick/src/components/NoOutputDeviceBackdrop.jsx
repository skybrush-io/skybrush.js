import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import Power from '@material-ui/icons/Power';
import { isThemeDark } from '@skybrush/app-theme-material-ui';
import BackgroundHint from '@skybrush/mui-components/src/BackgroundHint';

import { requestSerialPortsAndShowOutputDeviceDialog } from '~/features/output/actions';
import { hasConnectedOutputDevice } from '~/features/output/selectors';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    backdropFilter: 'blur(16px)',
    backgroundColor: isThemeDark(theme)
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(255, 255, 255, 0.5)',
    boxShadow: 'inset 0 16px 16px -16px rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.drawer + 1,
    opacity: 0,
    pointerEvents: 'none',
    transition: theme.transitions.create(['opacity'], {
      duration: theme.transitions.duration.short,
    }),
  },

  backdropOpen: {
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const NoOutputDeviceBackdrop = ({ onShowOutputDeviceDialog, open }) => {
  const classes = useStyles();
  return (
    <Box className={clsx(classes.backdrop, open && classes.backdropOpen)}>
      <BackgroundHint
        header='Disconnected'
        text='You need to select an output device to communicate with the drones'
        icon={<Power />}
        button={
          <Button onClick={onShowOutputDeviceDialog}>
            Select output device
          </Button>
        }
      />
    </Box>
  );
};

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
