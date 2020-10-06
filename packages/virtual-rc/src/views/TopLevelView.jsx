import React from 'react';

import Box from '@material-ui/core/Box';

import { RCChannelDisplay } from '../features/rc/components';

import Header from './Header';
import Footer from './Footer';

const TopLevelView = () => {
  return (
    <Box display='flex' flexDirection='column' height='100vh'>
      <Header />
      <RCChannelDisplay />
      <Footer />
    </Box>
  );
};

TopLevelView.propTypes = {};

export default TopLevelView;
