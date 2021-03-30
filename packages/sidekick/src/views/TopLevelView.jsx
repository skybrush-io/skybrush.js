import React from 'react';

import Box from '@material-ui/core/Box';

import Header from '~/components/header/Header';

import MainSplitPane from './MainSplitPane';

/* import MainArea from './MainArea'; */

const TopLevelView = () => {
  return (
    <Box display='flex' flexDirection='column' height='100vh'>
      <Header />
      <Box flex={1} position='relative'>
        <MainSplitPane />
      </Box>
    </Box>
  );
};

export default TopLevelView;
