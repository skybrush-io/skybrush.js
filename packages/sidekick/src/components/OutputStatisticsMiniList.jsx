import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import MiniList from '@skybrush/mui-components/src/MiniList';
import MiniListDivider from '@skybrush/mui-components/src/MiniListDivider';
import MiniListItem from '@skybrush/mui-components/src/MiniListItem';

import NullSafeTimeAgo from '~/components/NullSafeTimeAgo';
import { getConnectionState } from '~/features/output/selectors';
import { getOutputStatistics } from '~/features/stats/selectors';
import ConnectionState from '~/model/ConnectionState';
import { longTimeAgoFormatter } from '~/utils/formatting';

const connectionStateToIconPreset = (state) => state;
const connectionStateToLabel = (state) => {
  switch (state) {
    case ConnectionState.CONNECTED:
      return 'Connection established';

    case ConnectionState.CONNECTING:
      return 'Connecting...';

    case ConnectionState.DISCONNECTED:
      return 'Disconnected';

    case ConnectionState.DISCONNECTING:
      return 'Disconnecting...';

    default:
      return 'Unknown status';
  }
};

const listStyle = { minWidth: 300 };

const OutputStatisticsMiniList = ({
  bytesSent,
  connectionState,
  packetsSent,
  timestamp,
}) => (
  <MiniList style={listStyle}>
    <MiniListItem
      iconPreset={connectionStateToIconPreset(connectionState)}
      primaryText={connectionStateToLabel(connectionState)}
    />
    <MiniListDivider />
    <MiniListItem
      primaryText='Packets sent'
      secondaryText={String(packetsSent || 0)}
    />
    <MiniListItem
      primaryText='Bytes sent'
      secondaryText={prettyBytes(bytesSent || 0)}
    />
    <MiniListItem
      primaryText='Last packet sent'
      secondaryText={
        <NullSafeTimeAgo date={timestamp} formatter={longTimeAgoFormatter} />
      }
    />
  </MiniList>
);

OutputStatisticsMiniList.propTypes = {
  bytesSent: PropTypes.number,
  connectionState: PropTypes.string,
  packetsSent: PropTypes.number,
  timestamp: PropTypes.number,
};

export default connect(
  // mapStateToProps
  (state) => ({
    ...getOutputStatistics(state),
    connectionState: getConnectionState(state),
  }),
  // mapDispatchToProps
  {}
)(OutputStatisticsMiniList);
