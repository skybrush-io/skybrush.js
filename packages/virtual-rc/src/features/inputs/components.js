import { connect } from 'react-redux';

import InputManager_ from '../../components/InputManager';
import { setRCChannelValues } from '../rc/slice';

import { getInputDevicesInOrder } from './selectors';
import {
  createButtonStateTracker,
  mapAxisToPwmRange,
  stepToNextDiscreteValue,
  stepToPreviousDiscreteValue,
} from './utils';

export const InputManager = connect(
  // mapStateToProps
  (state) => ({
    inputs: getInputDevicesInOrder(state),
  }),
  // mapDispatchToProps
  () => {
    const rcChannels = [0, 0, 0, 0, 1500, 1500, 1500, 1500];
    const buttonStateTracker = createButtonStateTracker();

    buttonStateTracker.on('up', (index) => {
      if (index === 0) {
        // Button 0 (A): aux 1 (choreo)
        rcChannels[6] = stepToNextDiscreteValue(rcChannels[6], 2, {
          wrap: true,
        });
      } else if (index === 1) {
        // Button 1 (B): aux 2 (RTH)
        rcChannels[7] = stepToNextDiscreteValue(rcChannels[7], 2, {
          wrap: true,
        });
      } else if (index === 2) {
        // Button 2 (X): tuning (pyro)
        rcChannels[5] = stepToNextDiscreteValue(rcChannels[5], 2, {
          wrap: true,
        });
      } else if (index === 4) {
        // Button 4 (left bumper): previous mode on channel 5
        rcChannels[4] = stepToPreviousDiscreteValue(rcChannels[4], 6);
      } else if (index === 5) {
        // Button 5 (right bumper): next mode on channel 5
        rcChannels[4] = stepToNextDiscreteValue(rcChannels[4], 6);
      }
    });

    return (dispatch) => ({
      onStateChanged(buttons, axes) {
        // TODO(ntamas): make this mapping configurable

        // Feed the button states to the button state tracker
        buttonStateTracker.update(buttons);

        // Axis 0: yaw, mapped to RC channel 3
        rcChannels[3] = mapAxisToPwmRange(axes[0]);
        // Axis 1: throttle, reversed, mapped to RC channel 2
        rcChannels[2] = mapAxisToPwmRange(-axes[1]);
        // Axis 2: roll, mapped to RC channel 0
        rcChannels[0] = mapAxisToPwmRange(axes[2]);
        // Axis 3: pitch, reversed, mapped to RC channel 1
        rcChannels[1] = mapAxisToPwmRange(-axes[3]);

        // Left trigger button: throttle, mapped to RC channel 2
        // rcChannels[2] = mapButtonToPwmRange(buttons[6]);

        dispatch(setRCChannelValues(rcChannels));
      },
    });
  }
)(InputManager_);
