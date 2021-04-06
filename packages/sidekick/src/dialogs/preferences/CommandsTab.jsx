import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';

import {
  getCommandRepeatCountEvenIfDisabled,
  getCommandRepeatDelayEvenIfDisabled,
  isCommandRepeatingEnabled,
} from '~/features/settings/selectors';
import { setCommandRepeatingProperties } from '~/features/settings/slice';

const CommandsTab = ({
  isCommandRepeatingEnabled,
  repeatCount,
  repeatDelay,
  setCommandRepeatingEnabled,
  setRepeatCount,
  setRepeatDelay,
}) => (
  <Box pb={2}>
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={isCommandRepeatingEnabled}
            name='checkedA'
            onChange={setCommandRepeatingEnabled}
          />
        }
        label='Repeat every command'
      />
    </Box>
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
);

CommandsTab.propTypes = {
  isCommandRepeatingEnabled: PropTypes.bool,
  setRepeatCount: PropTypes.func,
  setRepeatDelay: PropTypes.func,
  repeatCount: PropTypes.number,
  repeatDelay: PropTypes.number,
  setCommandRepeatingEnabled: PropTypes.func,
};

export default connect(
  // mapStateToProps
  (state) => ({
    isCommandRepeatingEnabled: isCommandRepeatingEnabled(state),
    repeatCount: getCommandRepeatCountEvenIfDisabled(state),
    repeatDelay: getCommandRepeatDelayEvenIfDisabled(state),
  }),
  // mapDispatchToProps
  {
    setCommandRepeatingEnabled: (event) =>
      setCommandRepeatingProperties({ enabled: event.target.checked }),
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
