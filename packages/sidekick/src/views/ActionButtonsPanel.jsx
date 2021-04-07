import isNil from 'lodash-es/isNil';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

import Clear from '@material-ui/icons/Clear';
import Flag from '@material-ui/icons/Flag';
import FlightLand from '@material-ui/icons/FlightLand';
import Home from '@material-ui/icons/Home';
import PlayArrow from '@material-ui/icons/PlayArrow';

import { Colors } from '@skybrush/app-theme-material-ui';
import FormHeader from '@skybrush/mui-components/src/FormHeader';

import { FlightMode, isValidMAVLinkId } from '~/ardupilot';
import { disarm, flashColor, setColor, setFlightMode } from '~/commands';
import ColoredButton from '~/components/ColoredButton';
import { requestConfirmation } from '~/features/confirmation/actions';
import { sendMessage } from '~/features/output/slice';
import {
  getBroadcastCommandRequiresConfirmation,
  getUnicastCommandRequiresConfirmation,
} from '~/features/settings/selectors';
import { getSelectedUAVId } from '~/features/ui/selectors';

const ActionButton = ({ children, ...rest }) => (
  <Box mb={1} display='flex' flexDirection='column'>
    <ColoredButton {...rest}>{children}</ColoredButton>
  </Box>
);

ActionButton.propTypes = {
  children: PropTypes.node,
};

const SetColorButton = ({ color, label, setColor, ...rest }) => (
  <ColoredButton
    dense
    fullWidth
    color={color}
    onClick={() => setColor(color)}
    {...rest}
  >
    {label}
  </ColoredButton>
);

SetColorButton.propTypes = {
  color: PropTypes.string,
  label: PropTypes.string,
  setColor: PropTypes.func,
};

SetColorButton.defaultProps = {
  label: '\u00A0',
};

const ActionButtonsPanel = ({
  disarm,
  flashColor,
  setColor,
  setFlightMode,
}) => {
  return (
    <Box display='flex' flexDirection='column' px={2}>
      <FormHeader>Actions</FormHeader>
      <ActionButton
        color={Colors.success}
        icon={<PlayArrow />}
        onClick={() => setFlightMode(FlightMode.SHOW)}
      >
        Show mode
      </ActionButton>
      <ActionButton
        color={Colors.info}
        icon={<Flag />}
        onClick={() => setFlightMode(FlightMode.LOITER)}
      >
        Position hold
      </ActionButton>
      <ActionButton
        color={Colors.warning}
        icon={<Home />}
        onClick={() => setFlightMode(FlightMode.RETURN_TO_HOME)}
      >
        Return to home
      </ActionButton>
      <ActionButton
        color={Colors.seriousWarning}
        icon={<FlightLand />}
        onClick={() => setFlightMode(FlightMode.LAND)}
      >
        Land
      </ActionButton>
      <ActionButton
        color={Colors.error}
        icon={<Clear />}
        onClick={() => disarm({ force: true })}
      >
        Disarm
      </ActionButton>
      <FormHeader>Lights</FormHeader>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <SetColorButton color='#000000' setColor={setColor} label='Off' />
        </Grid>
        <Grid item xs={4}>
          <ColoredButton
            dense
            fullWidth
            color={Colors.warning}
            onClick={() => flashColor('#ffffff')}
          >
            Flash
          </ColoredButton>
        </Grid>
        <Grid item xs={4}>
          <SetColorButton color='#ffffff' setColor={setColor} label='On' />
        </Grid>
        <Grid item xs={2}>
          <SetColorButton color='#ff0000' setColor={setColor} />
        </Grid>
        <Grid item xs={2}>
          <SetColorButton color='#00ff00' setColor={setColor} />
        </Grid>
        <Grid item xs={2}>
          <SetColorButton color='#0000ff' setColor={setColor} />
        </Grid>
        <Grid item xs={2}>
          <SetColorButton color='#ffff00' setColor={setColor} />
        </Grid>
        <Grid item xs={2}>
          <SetColorButton color='#00ffff' setColor={setColor} />
        </Grid>
        <Grid item xs={2}>
          <SetColorButton color='#ff00ff' setColor={setColor} />
        </Grid>
      </Grid>
    </Box>
  );
};

ActionButtonsPanel.propTypes = {
  disarm: PropTypes.func,
  flashColor: PropTypes.func,
  setColor: PropTypes.func,
  setFlightMode: PropTypes.func,
};

const createMessageDispatcherThunk = ({ factory, confirmation }) => (
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
      const message =
        typeof confirmation === 'function'
          ? confirmation(selectedId, args)
          : message;

      dispatch(
        requestConfirmation({
          title: 'Are you sure?',
          message,
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
  const target = isBroadcast ? 'ALL the drones' : `drone ${id}`;

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

export default connect(
  // mapStateToProps
  () => ({}),
  // mapDispatchToProps
  {
    disarm: createMessageDispatcherThunk({
      factory: disarm,
      confirmation: (id) =>
        isNil(id)
          ? 'This action will disarm ALL the drones.'
          : `This action will disarm drone ${id}.`,
    }),
    flashColor: createMessageDispatcherThunk({ factory: flashColor }),
    setColor: createMessageDispatcherThunk({ factory: setColor }),
    setFlightMode: createMessageDispatcherThunk({
      factory: setFlightMode,
      confirmation: (id, args) => {
        const modeNumber = args && args.length > 0 ? args[0] : -1;
        return getConfirmationMessageForFlightMode(modeNumber, id);
      },
    }),
  }
)(ActionButtonsPanel);
