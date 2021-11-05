import React from 'react';

import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

import { isThemeDark } from '@skybrush/app-theme-mui';

const MainSwitch = styled((props) => (
  <Switch disableRipple focusVisibleClassName='.Mui-focusVisible' {...props} />
))(({ theme }) => ({
  width: 36,
  height: 20,
  padding: 0,
  margin: theme.spacing(1, 0),
  '& .MuiSwitch-switchBase': {
    padding: 1,
    color: isThemeDark(theme) ? '#9b9b9b' : '#fafafa',
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: theme.palette.common.white,
      '& + .MuiSwitch-track': {
        backgroundColor: '#52d869',
        opacity: 1,
        border: '1px solid #42ad37',
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: isThemeDark(theme)
        ? theme.palette.grey[600]
        : theme.palette.grey[100],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: isThemeDark(theme) ? 0.3 : 0.7,
    },
  },
  '& .MuiSwitch-thumb': {
    width: 18,
    height: 18,
  },
  '& .MuiSwitch-track': {
    borderRadius: 20 / 2,
    border: `1px solid ${
      isThemeDark(theme) ? '#111' : theme.palette.grey[400]
    }`,
    backgroundColor: theme.palette.grey[isThemeDark(theme) ? 900 : 50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
}));

export default MainSwitch;
