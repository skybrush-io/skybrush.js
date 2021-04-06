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

import { FLIGHT_MODE } from '~/ardupilot';
import {
  bindToAction,
  disarm,
  flashColor,
  setColor,
  setFlightMode,
} from '~/commands';
import ColoredButton from '~/components/ColoredButton';
import { sendMessage } from '~/features/output/slice';

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
        onClick={() => setFlightMode(FLIGHT_MODE.SHOW)}
      >
        Show mode
      </ActionButton>
      <ActionButton
        color={Colors.info}
        icon={<Flag />}
        onClick={() => setFlightMode(FLIGHT_MODE.LOITER)}
      >
        Position hold
      </ActionButton>
      <ActionButton
        color={Colors.warning}
        icon={<Home />}
        onClick={() => setFlightMode(FLIGHT_MODE.RETURN_TO_HOME)}
      >
        Return to home
      </ActionButton>
      <ActionButton
        color={Colors.seriousWarning}
        icon={<FlightLand />}
        onClick={() => setFlightMode(FLIGHT_MODE.LAND)}
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

export default connect(
  // mapStateToProps
  () => ({}),
  // mapDispatchToProps
  bindToAction(sendMessage, { disarm, flashColor, setColor, setFlightMode })
)(ActionButtonsPanel);
