import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';

import Box from '@mui/material/Box';

import { FadeAndSlide } from '@skybrush/app-theme-mui/lib/transitions';

import { RCChannelDisplay } from '../features/rc/components';
import { getCurrentScreen } from '../features/ui/selectors';
import {
  ReturnToMainScreenButton,
  ScreenSelectorButtons,
} from '../features/ui/components';

import OutputSettingsPanel from './OutputSettingsPanel';

/**
 * Returns the component or components to show for the given screen of the
 * main area.
 */
function getContentsForScreen(screen) {
  switch (screen) {
    case 'inputs':
      return (
        <>
          <div>Not implemented yet</div>
          <ReturnToMainScreenButton />
        </>
      );

    case 'outputs':
      return (
        <>
          <OutputSettingsPanel />
          <ReturnToMainScreenButton />
        </>
      );

    default:
      return (
        <>
          <RCChannelDisplay />
          <ScreenSelectorButtons />
        </>
      );
  }
}

const MainArea = ({ screen }) => (
  <Box flex={1} position='relative'>
    <TransitionGroup>
      <FadeAndSlide key={screen} timeout={500} direction='left'>
        <Box
          display='flex'
          flexDirection='column'
          position='absolute'
          left={0}
          right={0}
          top={0}
          bottom={0}
        >
          {getContentsForScreen(screen)}
        </Box>
      </FadeAndSlide>
    </TransitionGroup>
  </Box>
);

MainArea.propTypes = {
  screen: PropTypes.oneOf(['inputs', 'main', 'outputs']),
};

export default connect(
  // mapStateToProps
  (state) => ({
    screen: getCurrentScreen(state),
  }),
  // mapDispatchToProps
  {}
)(MainArea);
