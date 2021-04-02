import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';

import NoOutputDeviceHint from '~/components/NoOutputDeviceHint';
import Header from '~/components/header/Header';
import { hasOutputDevice } from '~/features/output/selectors';

import MainSplitPane from './MainSplitPane';

/* import MainArea from './MainArea'; */

const TopLevelView = ({ hasOutputDevice }) => {
  return (
    <Box display='flex' flexDirection='column' height='100vh'>
      <Header />
      <Box flex={1} position='relative'>
        <Fade in={!hasOutputDevice}>
          <NoOutputDeviceHint />
        </Fade>
        <MainSplitPane />
      </Box>
    </Box>
  );
};

TopLevelView.propTypes = {
  hasOutputDevice: PropTypes.bool,
};

export default connect(
  // mapStateToProps
  (state) => ({
    hasOutputDevice: hasOutputDevice(state),
  }),
  // mapDispatchToProps
  {}
)(TopLevelView);
