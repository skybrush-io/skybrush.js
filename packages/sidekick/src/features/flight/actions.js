import isNil from 'lodash-es/isNil';

import { FlightMode, isValidMAVLinkId } from '~/ardupilot';
import { requestConfirmation } from '~/features/confirmation/actions';
import { sendMessage } from '~/features/output/slice';
import {
  getBroadcastCommandRequiresConfirmation,
  getUnicastCommandRequiresConfirmation,
} from '~/features/settings/selectors';
import { getSelectedUAVId } from '~/features/ui/selectors';

import * as commands from './commands';

const createMessageDispatcherThunkFactory = ({ factory, confirmation }) => (
  ...args
) => {
  const thunk = (dispatch, getState) => {
    const state = getState();
    const selectedId = getSelectedUAVId(state);
    if (!isNil(selectedId) && !isValidMAVLinkId(selectedId)) {
      return;
    }

    const isBroadcast = isNil(selectedId);

    const message = { ...factory(...args) };
    if (!isBroadcast) {
      message.to = selectedId;
    }

    const action = sendMessage(message);
    const needsConfirmation = isBroadcast
      ? getBroadcastCommandRequiresConfirmation(state)
      : getUnicastCommandRequiresConfirmation(state);

    if (needsConfirmation && confirmation) {
      const text =
        typeof confirmation === 'function'
          ? confirmation(selectedId, args)
          : confirmation;

      dispatch(
        requestConfirmation({
          title: 'Are you sure?',
          message: {
            text,
            format: 'markdown',
          },
          action,
        })
      );
    } else {
      dispatch(action);
    }
  };

  return thunk;
};

const getConfirmationMessageForFlightMode = (modeNumber, id) => {
  const isBroadcast = isNil(id);
  const target = isBroadcast ? '**ALL the drones**' : `**drone ${id}**`;

  switch (modeNumber) {
    case FlightMode.SHOW:
      return `This action will switch ${target} to drone show mode.`;

    case FlightMode.LOITER:
      return `This action will switch ${target} to loiter mode. If the drone is currently airborne, it will hover in place at its current position.`;

    case FlightMode.POSITION_HOLD:
      return `This action will switch ${target} to position hold mode. If the drone is currently airborne, it will hover in place at its current position.`;

    case FlightMode.RETURN_TO_HOME:
      return `This action will instruct ${target} to return to their home positions in a straight line.`;

    case FlightMode.LAND:
      return `This action will instruct ${target} to land at their current location.`;

    default:
      return `This action will change the flight mode on ${target}.`;
  }
};

export const disarm = createMessageDispatcherThunkFactory({
  factory: commands.disarm,
  confirmation: (id) =>
    isNil(id)
      ? 'This action will disarm ALL the drones.'
      : `This action will disarm drone ${id}.`,
});

export const flashColor = createMessageDispatcherThunkFactory({
  factory: commands.flashColor,
});

export const setColor = createMessageDispatcherThunkFactory({
  factory: commands.setColor,
});

export const setFlightMode = createMessageDispatcherThunkFactory({
  factory: commands.setFlightMode,
  confirmation: (id, args) => {
    const modeNumber = args && args.length > 0 ? args[0] : -1;
    return getConfirmationMessageForFlightMode(modeNumber, id);
  },
});

export const flashLights = () => flashColor('#ffffff');
export const land = () => setFlightMode(FlightMode.LAND);
export const returnToHome = () => setFlightMode(FlightMode.RETURN_TO_HOME);
export const switchToPositionHold = () =>
  setFlightMode(FlightMode.POSITION_HOLD);
export const switchToShowMode = () => setFlightMode(FlightMode.SHOW);
