import PropTypes from 'prop-types';
import React from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

const BaudRateSelector = ({
  name,
  onBlur,
  onChange,
  onFocus,
  onRefresh,
  value,
  ...rest
}) => {
  return (
    <FormControl variant='filled' {...rest}>
      <InputLabel id='baud-rate-selector-label'>Baud rate</InputLabel>
      <Select
        labelId='baud-rate-selector-label'
        id='baud-rate-selector'
        name={name}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
      >
        {BAUD_RATES.map((baudRate) => (
          <MenuItem key={baudRate} value={baudRate}>
            {baudRate} baud
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

BaudRateSelector.propTypes = {
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onRefresh: PropTypes.func,
  value: PropTypes.number,
};

export default BaudRateSelector;
