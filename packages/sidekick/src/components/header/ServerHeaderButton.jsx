import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ServerIcon from '@material-ui/icons/Dns';

import GenericHeaderButton from '@skybrush/mui-components/src/GenericHeaderButton';
import LazyTooltip from '@skybrush/mui-components/src/LazyTooltip';
import SidebarBadge from '@skybrush/mui-components/src/SidebarBadge';

import ServerStatisticsMiniList from '~/components/ServerStatisticsMiniList';
import { getServerConnectionState } from '~/features/input/selectors';
import ConnectionState from '~/model/ConnectionState';
import { showPreferencesDialogWithSelectedTab } from '../../features/ui/actions';

const connectionStateToColor = (state) => {
  switch (state) {
    case ConnectionState.DISCONNECTED:
      return ConnectionState.toColor(ConnectionState.DISCONNECTING);

    default:
      return ConnectionState.toColor(state);
  }
};

const BADGE_OFFSET = [24, 8];

const ServerHeaderButton = ({ connectionState, ...rest }) => (
  <LazyTooltip content={<ServerStatisticsMiniList />}>
    <GenericHeaderButton label='Server' {...rest}>
      <ServerIcon />
      <SidebarBadge
        anchor='topLeft'
        color={connectionStateToColor(connectionState)}
        offset={BADGE_OFFSET}
        visible={connectionState !== ConnectionState.DISCONNECTED}
      />
    </GenericHeaderButton>
  </LazyTooltip>
);

ServerHeaderButton.propTypes = {
  connectionState: PropTypes.string,
};

export default connect(
  // mapStateToProps
  (state) => ({
    connectionState: getServerConnectionState(state),
  }),
  // mapDispatchToProps
  {
    onClick: () => showPreferencesDialogWithSelectedTab('server'),
  }
)(ServerHeaderButton);
