import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Power from '@material-ui/icons/Power';

import GenericHeaderButton from '@skybrush/mui-components/src/GenericHeaderButton';
import SidebarBadge from '@skybrush/mui-components/src/SidebarBadge';

import { requestSerialPortsAndShowOutputDeviceDialog } from '~/features/output/actions';
import {
  describeOutputDevice,
  getConnectionState,
  hasOutputDevice,
} from '~/features/output/selectors';
import { Colors } from '@skybrush/app-theme-material-ui';

const connectionStateToColor = (state) => {
  switch (state) {
    case 'connected':
      return Colors.success;

    case 'disconnected':
      return Colors.error;

    case 'connecting':
    case 'disconnecting':
      return Colors.warning;

    default:
      return Colors.missing;
  }
};

const BADGE_OFFSET = [24, 8];

const SerialPortHeaderButton = ({
  connectionState,
  hasOutputDevice,
  ...rest
}) => (
  <GenericHeaderButton {...rest}>
    <Power />
    <SidebarBadge
      anchor='topLeft'
      color={connectionStateToColor(connectionState)}
      offset={BADGE_OFFSET}
      visible={hasOutputDevice}
    />
  </GenericHeaderButton>
);

SerialPortHeaderButton.propTypes = {
  connectionState: PropTypes.string,
  hasOutputDevice: PropTypes.bool,
};

export default connect(
  // mapStateToProps
  (state) => ({
    label: describeOutputDevice(state) || 'No output device',
    connectionState: getConnectionState(state),
    hasOutputDevice: hasOutputDevice(state),
  }),
  // mapDispatchToProps
  {
    onClick: requestSerialPortsAndShowOutputDeviceDialog,
  }
)(SerialPortHeaderButton);
