import React from 'react';

import Box from '@material-ui/core/Box';

import Header from './Header';
import MainArea from './MainArea';
import Footer from './Footer';

const TopLevelView = () => {
  return (
    <Box display='flex' flexDirection='column' height='100vh'>
      <Header />
      <MainArea />
      <Footer />
    </Box>
  );
};

TopLevelView.propTypes = {};

export default TopLevelView;
