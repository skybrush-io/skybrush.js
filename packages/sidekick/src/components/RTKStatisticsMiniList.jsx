import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import TimeAgo from 'react-timeago';

import MiniList from '@skybrush/mui-components/src/MiniList';
import MiniListDivider from '@skybrush/mui-components/src/MiniListDivider';
import MiniListItem from '@skybrush/mui-components/src/MiniListItem';

import { getRTKStatistics } from '~/features/stats/selectors';
import { longTimeAgoFormatter } from '~/utils/formatting';

const listStyle = { minWidth: 300 };

const RTKStatisticsMiniList = ({
  bytesSent,
  packetsSent,
  recency,
  timestamp,
}) => {
  return (
    <MiniList style={listStyle}>
      {recency >= 2 ? (
        <MiniListItem
          iconPreset='connected'
          primaryText='Receiving RTK corrections'
        />
      ) : recency >= 1 ? (
        <MiniListItem
          iconPreset='warning'
          primaryText='RTK corrections stalled'
        />
      ) : (
        <MiniListItem
          iconPreset='disconnected'
          primaryText='No RTK corrections received recently'
        />
      )}
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
        primaryText='Last correction sent'
        secondaryText={
          <TimeAgo date={timestamp} formatter={longTimeAgoFormatter} />
        }
      />
    </MiniList>
  );
};

RTKStatisticsMiniList.propTypes = {
  bytesSent: PropTypes.number,
  packetsSent: PropTypes.number,
  recency: PropTypes.number,
  timestamp: PropTypes.number,
};

export default connect(
  // mapStateToProps
  (state) => getRTKStatistics(state),
  // mapDispatchToProps
  {}
)(RTKStatisticsMiniList);
