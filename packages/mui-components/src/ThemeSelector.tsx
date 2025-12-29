import FormControl, { type FormControlProps } from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectProps } from '@mui/material/Select';

import type { ThemeType } from '@skybrush/app-theme-mui';

export type ThemeSelectorProps = {
  onChange: SelectProps['onChange'];
  value: ThemeType;
} & Omit<FormControlProps, 'onChange'>;

const ThemeSelector = ({ onChange, value, ...rest }: ThemeSelectorProps) => (
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

export default ThemeSelector;
