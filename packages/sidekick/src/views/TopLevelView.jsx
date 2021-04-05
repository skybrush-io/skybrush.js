import React from 'react';

import Box from '@material-ui/core/Box';

import NoOutputDeviceBackdrop from '~/components/NoOutputDeviceBackdrop';
import Header from '~/components/header/Header';

import MainSplitPane from './MainSplitPane';

/* import MainArea from './MainArea'; */

const TopLevelView = () => (
  <Box display='flex' flexDirection='column' height='100vh'>
    <Header />
    <Box flex={1} position='relative'>
      <NoOutputDeviceBackdrop />
      <MainSplitPane />
    </Box>
  </Box>
);

TopLevelView.propTypes = {};

export default TopLevelView;
