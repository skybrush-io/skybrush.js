import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Power from '@material-ui/icons/Power';

import GenericHeaderButton from '@skybrush/mui-components/src/GenericHeaderButton';
import LazyTooltip from '@skybrush/mui-components/src/LazyTooltip';
import SidebarBadge from '@skybrush/mui-components/src/SidebarBadge';

import OutputStatisticsMiniList from '~/components/OutputStatisticsMiniList';
import { requestSerialPortsAndShowOutputDeviceDialog } from '~/features/output/actions';
import {
  describeOutputDevice,
  getConnectionState,
  hasOutputDevice,
} from '~/features/output/selectors';
import ConnectionState from '~/model/ConnectionState';

const BADGE_OFFSET = [24, 8];

const SerialPortHeaderButton = ({
  connectionState,
  hasOutputDevice,
  ...rest
}) => (
  <LazyTooltip content={<OutputStatisticsMiniList />}>
    <GenericHeaderButton {...rest}>
      <Power />
      <SidebarBadge
        anchor='topLeft'
        color={ConnectionState.toColor(connectionState)}
        offset={BADGE_OFFSET}
        visible={hasOutputDevice}
      />
    </GenericHeaderButton>
  </LazyTooltip>
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
