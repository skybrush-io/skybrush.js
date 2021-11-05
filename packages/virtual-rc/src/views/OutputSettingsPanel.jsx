import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { getNumberOfRCChannels } from '../features/rc/selectors';
import { setNumberOfRCChannels } from '../features/rc/slice';

const OutputSettingsPanel = ({ numChannels, onNumChannelsChanged }) => (
  <Box flex={1} p={2}>
    <form noValidate autoComplete='off'>
      <TextField
        fullWidth
        select
        id='numChannels'
        label='Number of channels'
        value={numChannels}
        variant='filled'
        onChange={(event) =>
          onNumChannelsChanged(Number.parseInt(event.target.value, 10))
        }
      >
        <MenuItem dense value='8'>
          8 channels
        </MenuItem>
        <MenuItem dense value='16'>
          16 channels
        </MenuItem>
      </TextField>
    </form>
  </Box>
);

OutputSettingsPanel.propTypes = {
  numChannels: PropTypes.number,
  onNumChannelsChanged: PropTypes.func,
};

export default connect(
  // mapStateToProps
  (state) => ({
    numChannels: getNumberOfRCChannels(state),
  }),
  // mapDispatchToProps
  {
    onNumChannelsChanged: setNumberOfRCChannels,
  }
)(OutputSettingsPanel);
