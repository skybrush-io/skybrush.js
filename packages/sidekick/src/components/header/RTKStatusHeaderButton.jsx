import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Antenna from '@material-ui/icons/SettingsInputAntenna';

import GenericHeaderButton from '@skybrush/mui-components/src/GenericHeaderButton';
import LazyTooltip from '@skybrush/mui-components/src/LazyTooltip';
import SidebarBadge from '@skybrush/mui-components/src/SidebarBadge';

import RTKStatisticsMiniList from '~/components/RTKStatisticsMiniList';
import { getRTKConnectionState } from '~/features/stats/selectors';
import ConnectionState from '~/model/ConnectionState';

const connectionStateToColor = (state) => {
  switch (state) {
    case ConnectionState.DISCONNECTED:
      return ConnectionState.toColor(ConnectionState.DISCONNECTING);

    default:
      return ConnectionState.toColor(state);
  }
};

const BADGE_OFFSET = [24, 8];

const RTKStatusHeaderButton = ({ connectionState }) => (
  <LazyTooltip content={<RTKStatisticsMiniList />}>
    <GenericHeaderButton
      disabled={connectionState === ConnectionState.DISCONNECTED}
      label='RTK'
    >
      <Antenna />
      <SidebarBadge
        anchor='topLeft'
        color={connectionStateToColor(connectionState)}
        offset={BADGE_OFFSET}
        visible={connectionState !== ConnectionState.DISCONNECTED}
      />
    </GenericHeaderButton>
  </LazyTooltip>
);

RTKStatusHeaderButton.propTypes = {
  connectionState: PropTypes.string,
};

export default connect(
  // mapStateToProps
  (state) => ({
    connectionState: getRTKConnectionState(state),
  }),
  // mapDispatchToProps
  {}
)(RTKStatusHeaderButton);
