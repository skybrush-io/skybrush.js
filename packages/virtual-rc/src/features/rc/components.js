import React, { useCallback } from 'react';
import { connect, useSelector, useStore } from 'react-redux';

import MasterSwitch_ from '../../components/MasterSwitch';
import RCChannelDisplay_ from '../../components/RCChannelDisplay';
import RCOutputManager_ from '../../components/RCOutputManager';

import {
  getRCChannelLabels,
  getRCChannelValues,
  isRCPowerSwitchOn,
} from './selectors';
import { setPowerSwitch, setRCChannelValue } from './slice';

export const MasterSwitch = connect(
  // mapStateToProps
  (state) => ({
    checked: isRCPowerSwitchOn(state),
  }),
  // mapDispatchToProps
  {
    onChange: (event) => setPowerSwitch(event.target.checked),
  }
)(MasterSwitch_);

export const RCChannelDisplay = connect(
  // mapStateToProps
  (state) => ({
    labels: getRCChannelLabels(state),
    values: getRCChannelValues(state),
  }),
  // mapDispatchToProps
  {
    onChangeChannel: (index, value) => setRCChannelValue({ index, value }),
  }
)(RCChannelDisplay_);

export const RCOutputManager = () => {
  const store = useStore();
  const enabled = useSelector(isRCPowerSwitchOn);
  const getter = useCallback(() => getRCChannelValues(store.getState()), [
    store,
  ]);
  const sender = window.bridge.sendRCChannelValues;

  return React.createElement(RCOutputManager_, {
    enabled,
    getter,
    sender,
    store,
  });
};