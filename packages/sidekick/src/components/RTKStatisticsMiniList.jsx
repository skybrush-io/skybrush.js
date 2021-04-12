import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import MiniList from '@skybrush/mui-components/src/MiniList';
import MiniListDivider from '@skybrush/mui-components/src/MiniListDivider';
import MiniListItem from '@skybrush/mui-components/src/MiniListItem';

import { getRTKStatistics } from '~/features/stats/selectors';

const RTKStatisticsMiniList = ({ bytesSent, packetsSent, recency }) => {
  return (
    <MiniList>
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
    </MiniList>
  );
};

RTKStatisticsMiniList.propTypes = {
  bytesSent: PropTypes.number,
  packetsSent: PropTypes.number,
  recency: PropTypes.number,
};

export default connect(
  // mapStateToProps
  (state) => getRTKStatistics(state),
  // mapDispatchToProps
  {}
)(RTKStatisticsMiniList);
