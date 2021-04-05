import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { Status } from '@skybrush/app-theme-material-ui';
import LabeledStatusLight from '@skybrush/mui-components/src/LabeledStatusLight';

import { getConnectionState } from '~/features/output/selectors';

const statusToLabel = (status) => {
  switch (status) {
    case 'connected':
      return 'Connected';

    case 'connecting':
      return 'Connection in progress...';

    case 'disconnected':
      return 'Not connected';

    case 'disconnecting':
      return 'Disconnecting...';

    default:
      return 'Unknown status';
  }
};

const statusToSemantics = (status) => {
  switch (status) {
    case 'connected':
      return Status.SUCCESS;

    case 'connecting':
      return Status.NEXT;

    case 'disconnected':
      return Status.OFF;

    case 'disconnecting':
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
  status: PropTypes.oneOf([
    'connected',
    'connecting',
    'disconnected',
    'disconnecting',
  ]),
};

export default connect(
  // mapStateToProps
  (state) => ({
    status: getConnectionState(state),
  }),
  // mapDispatchToProps
  {}
)(ConnectionStatusIndicator);
