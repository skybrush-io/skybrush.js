import React from 'react';

import Box from '@material-ui/core/Box';

import Header from '~/components/header/Header';
import SplitPane from 'react-split-pane';

/* import MainArea from './MainArea'; */

const TopLevelView = () => {
  return (
    <Box display='flex' flexDirection='column' height='100vh'>
      <Header />
      <Box flex={1} position='relative'>
        <SplitPane
          primary='second'
          split='vertical'
          minSize={80}
          defaultSize={240}
        >
          <div>A</div>
          <div>B</div>
        </SplitPane>
      </Box>
    </Box>
  );
};

TopLevelView.propTypes = {};

export default TopLevelView;
