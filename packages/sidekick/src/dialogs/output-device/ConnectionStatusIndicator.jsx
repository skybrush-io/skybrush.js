import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Status } from '@skybrush/app-theme-mui';
import LabeledStatusLight from '@skybrush/mui-components/src/LabeledStatusLight';

import { getConnectionState } from '~/features/output/selectors';
import ConnectionState from '~/model/ConnectionState';

const statusToLabel = (status) => {
  switch (status) {
    case ConnectionState.CONNECTED:
      return 'Connected';

    case ConnectionState.CONNECTING:
      return 'Connection in progress...';

    case ConnectionState.DISCONNECTED:
      return 'Not connected';

    case ConnectionState.DISCONNECTING:
      return 'Disconnecting...';

    default:
      return 'Unknown status';
  }
};

const statusToSemantics = (status) => {
  switch (status) {
    case ConnectionState.CONNECTED:
      return Status.SUCCESS;

    case ConnectionState.CONNECTING:
      return Status.NEXT;

    case ConnectionState.DISCONNECTED:
      return Status.OFF;

    case ConnectionState.DISCONNECTING:
      return Status.WARNING;

    default:
      return 'Unknown status';
  }
};

const ConnectionStatusIndicator = ({ status, ...rest }) => (
  <Box {...rest}>
    <LabeledStatusLight status={statusToSemantics(status)} size='normal'>
      <Typography variant='body2' component='span'>
        {statusToLabel(status)}
      </Typography>
    </LabeledStatusLight>
  </Box>
);

ConnectionStatusIndicator.propTypes = {
  status: PropTypes.oneOf(ConnectionState.ALL),
};

export default connect(
  // mapStateToProps
  (state) => ({
    status: getConnectionState(state),
  }),
  // mapDispatchToProps
  {}
)(ConnectionStatusIndicator);
