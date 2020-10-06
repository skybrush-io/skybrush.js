import React from 'react';
import { connect } from 'react-redux';

import GamepadIcon from '@material-ui/icons/SportsEsports';
import RemoteIcon from '@material-ui/icons/SettingsRemote';

import HorizontalButtonBar from '../../components/HorizontalButtonBar';

// import { getCurrentScreen } from './selectors';
import { setCurrentScreen } from './slice';

const SCREENS = [
  {
    id: 'inputs',
    label: 'Inputs',
    icon: <GamepadIcon />,
    disabled: true,
  },
  {
    id: 'outputs',
    label: 'Outputs',
    icon: <RemoteIcon />,
  },
];

const MAIN_SCREEN = {
  id: 'main',
  label: 'Back to main screen',
};

export const ScreenSelectorButtons = connect(
  // mapStateToProps
  () => ({
    buttons: SCREENS,
  }),
  // mapDispatchToProps
  {
    onClick: setCurrentScreen,
  }
)(HorizontalButtonBar);

export const ReturnToMainScreenButton = connect(
  // mapStateToProps
  () => ({
    buttons: [MAIN_SCREEN],
  }),
  // mapDispatchToProps
  {
    onClick: setCurrentScreen,
  }
)(HorizontalButtonBar);
