import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import FormHeader from '@skybrush/mui-components/lib/FormHeader';

import {
  getBroadcastCommandRequiresConfirmation,
  getCommandRepeatCountEvenIfDisabled,
  getCommandRepeatDelayEvenIfDisabled,
  getUnicastCommandRequiresConfirmation,
  isCommandRepeatingEnabled,
} from '~/features/settings/selectors';
import {
  setCommandConfirmationProperties,
  setCommandRepeatingProperties,
} from '~/features/settings/slice';

const CommandsTab = ({
  confirmationNeededForBroadcast,
  confirmationNeededForUnicast,
  isCommandRepeatingEnabled,
  repeatCount,
  repeatDelay,
  setCommandRepeatingEnabled,
  setConfirmationNeededForBroadcast,
  setConfirmationNeededForUnicast,
  setRepeatCount,
  setRepeatDelay,
}) => (
  <Box>
    <Box pb={2}>
      <FormControlLabel
        control={
          <Checkbox
            checked={isCommandRepeatingEnabled}
            onChange={setCommandRepeatingEnabled}
          />
        }
        label='Repeat every command'
      />
      <Box pl={4} display='flex' flexDirection='row' alignItems='baseline'>
        <TextField
          disabled={!isCommandRepeatingEnabled}
          label='Repeat count'
          variant='filled'
          type='number'
          InputProps={{
            endAdornment: <InputAdornment position='end'>times</InputAdornment>,
          }}
          value={repeatCount}
          onChange={setRepeatCount}
        />
        <Box p={1} />
        <TextField
          disabled={!isCommandRepeatingEnabled}
          label='Delay between attempts'
          variant='filled'
          type='number'
          InputProps={{
            endAdornment: <InputAdornment position='end'>msec</InputAdornment>,
          }}
          value={repeatDelay}
          onChange={setRepeatDelay}
        />
      </Box>
    </Box>
    <FormHeader>Confirmations</FormHeader>
    <FormControlLabel
      control={
        <Checkbox
          checked={confirmationNeededForBroadcast}
          onChange={setConfirmationNeededForBroadcast}
        />
      }
      label='Ask for confirmation before broadcasting commands'
    />
    <FormControlLabel
      control={
        <Checkbox
          checked={confirmationNeededForUnicast}
          onChange={setConfirmationNeededForUnicast}
        />
      }
      label='Ask for confirmation before sending commands to individual drones'
    />
    <Box pl={4} pb={1}>
      <Typography variant='caption' color='textSecondary'>
        Commands that only affect the lights will never need a confirmation.
      </Typography>
    </Box>
  </Box>
);

CommandsTab.propTypes = {
  confirmationNeededForBroadcast: PropTypes.bool,
  confirmationNeededForUnicast: PropTypes.bool,
  isCommandRepeatingEnabled: PropTypes.bool,
  setRepeatCount: PropTypes.func,
  setRepeatDelay: PropTypes.func,
  repeatCount: PropTypes.number,
  repeatDelay: PropTypes.number,
  setCommandRepeatingEnabled: PropTypes.func,
  setConfirmationNeededForBroadcast: PropTypes.func,
  setConfirmationNeededForUnicast: PropTypes.func,
};

export default connect(
  // mapStateToProps
  (state) => ({
    confirmationNeededForBroadcast: getBroadcastCommandRequiresConfirmation(
      state
    ),
    confirmationNeededForUnicast: getUnicastCommandRequiresConfirmation(state),
    isCommandRepeatingEnabled: isCommandRepeatingEnabled(state),
    repeatCount: getCommandRepeatCountEvenIfDisabled(state),
    repeatDelay: getCommandRepeatDelayEvenIfDisabled(state),
  }),
  // mapDispatchToProps
  {
    setCommandRepeatingEnabled: (event) =>
      setCommandRepeatingProperties({ enabled: event.target.checked }),
    setConfirmationNeededForBroadcast: (event) =>
      setCommandConfirmationProperties({ broadcast: event.target.checked }),
    setConfirmationNeededForUnicast: (event) =>
      setCommandConfirmationProperties({ unicast: event.target.checked }),
    setRepeatCount: (event) =>
      setCommandRepeatingProperties({
        count: Number.parseInt(event.target.value, 10),
      }),
    setRepeatDelay: (event) =>
      setCommandRepeatingProperties({
        delay: Number.parseInt(event.target.value, 10),
      }),
  }
)(CommandsTab);
