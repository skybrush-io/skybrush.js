import PropTypes from 'prop-types';
import React from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const ThemeSelector = ({ onChange, value, ...rest }) => (
  <FormControl fullWidth variant='filled' {...rest}>
    <InputLabel id='display-theme-label'>Theme</InputLabel>
    <Select
      labelId='display-theme-label'
      name='theme'
      value={value}
      onChange={onChange}
    >
      <MenuItem value='auto'>
        Choose automatically based on OS settings
      </MenuItem>
      <MenuItem value='light'>Light mode</MenuItem>
      <MenuItem value='dark'>Dark mode</MenuItem>
    </Select>
  </FormControl>
);

ThemeSelector.propTypes = {
  value: PropTypes.oneOf(['auto', 'dark', 'light']),
  onChange: PropTypes.func,
};

export default ThemeSelector;
