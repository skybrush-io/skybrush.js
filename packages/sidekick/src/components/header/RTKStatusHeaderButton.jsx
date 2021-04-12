import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Antenna from '@material-ui/icons/SettingsInputAntenna';

import GenericHeaderButton from '@skybrush/mui-components/src/GenericHeaderButton';
import SidebarBadge from '@skybrush/mui-components/src/SidebarBadge';

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
  <GenericHeaderButton label='RTK'>
    <Antenna />
    <SidebarBadge
      anchor='topLeft'
      color={connectionStateToColor(connectionState)}
      offset={BADGE_OFFSET}
      visible={connectionState !== ConnectionState.DISCONNECTED}
    />
  </GenericHeaderButton>
);

RTKStatusHeaderButton.propTypes = {
  connectionState: PropTypes.string,
};

export default connect(
  // mapStateToProps
  () => ({
    connectionState: 'disconnected',
  }),
  // mapDispatchToProps
  {}
)(RTKStatusHeaderButton);
