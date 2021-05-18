import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';

import { isThemeDark } from '@skybrush/app-theme-material-ui';

const MainSwitch = withStyles((theme) => ({
  root: {
    width: 36,
    height: 20,
    padding: 0,
    margin: theme.spacing(1, 0),
  },
  switchBase: {
    padding: 1,
    color: isThemeDark(theme) ? '#9b9b9b' : '#fafafa',
    '&$checked': {
      transform: 'translateX(16px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#52d869',
        opacity: 1,
        border: '1px solid #42ad37',
      },
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 18,
    height: 18,
  },
  track: {
    borderRadius: 20 / 2,
    border: `1px solid ${
      isThemeDark(theme) ? '#111' : theme.palette.grey[400]
    }`,
    backgroundColor: theme.palette.grey[isThemeDark(theme) ? 900 : 50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      disableRipple
      focusVisibleClassName={classes.focusVisible}
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

export default MainSwitch;
