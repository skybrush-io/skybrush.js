import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import MiniList from '@skybrush/mui-components/src/MiniList';
import MiniListDivider from '@skybrush/mui-components/src/MiniListDivider';
import MiniListItem from '@skybrush/mui-components/src/MiniListItem';

import NullSafeTimeAgo from '~/components/NullSafeTimeAgo';
import {
  getServerConnectionState,
  isServerConnectionActive,
} from '~/features/input/selectors';
import { getServerStatistics } from '~/features/stats/selectors';
import ConnectionState from '~/model/ConnectionState';
import { longTimeAgoFormatter } from '~/utils/formatting';

const connectionStateToIconPreset = (state) => state;
const connectionStateToLabel = (state, active) => {
  switch (state) {
    case ConnectionState.CONNECTED:
      return 'Connection established';

    case ConnectionState.CONNECTING:
      return 'Connecting...';

    case ConnectionState.DISCONNECTED:
      return active ? 'Disconnected, reconnection pending' : 'Disconnected';

    case ConnectionState.DISCONNECTING:
      return 'Disconnecting...';

    default:
      return 'Unknown status';
  }
};

const listStyle = { minWidth: 300 };

const ServerStatisticsMiniList = ({
  connectionActive,
  connectionState,
  packetsReceived,
  timestamp,
}) => {
  return (
    <MiniList style={listStyle}>
      <MiniListItem
        iconPreset={connectionStateToIconPreset(connectionState)}
        primaryText={connectionStateToLabel(connectionState, connectionActive)}
      />
      <MiniListDivider />
      <MiniListItem
        primaryText='Packets received'
        secondaryText={String(packetsReceived || 0)}
      />
      <MiniListItem
        primaryText='Last packet received'
        secondaryText={
          <NullSafeTimeAgo date={timestamp} formatter={longTimeAgoFormatter} />
        }
      />
    </MiniList>
  );
};

ServerStatisticsMiniList.propTypes = {
  connectionActive: PropTypes.bool,
  connectionState: PropTypes.string,
  packetsReceived: PropTypes.number,
  timestamp: PropTypes.number,
};

export default connect(
  // mapStateToProps
  (state) => ({
    ...getServerStatistics(state),
    connectionState: getServerConnectionState(state),
    connectionActive: isServerConnectionActive(state),
  }),
  // mapDispatchToProps
  {}
)(ServerStatisticsMiniList);
