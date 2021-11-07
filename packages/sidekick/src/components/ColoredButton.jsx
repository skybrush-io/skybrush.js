import createColor from 'color';
import PropTypes from 'prop-types';
import React from 'react';

import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';

const ColoredButtonBase = styled(ButtonBase, {
  shouldForwardProp: (name) =>
    name !== 'color' && name !== 'dense' && name !== 'fullWidth',
})(({ color, dense, fullWidth, theme }) => {
  const parsedColor = createColor(color);
  const result = {
    ...theme.typography.button,
    backgroundColor: color,
    borderRadius: theme.spacing(0.5),
    boxShadow: theme.shadows[2],
    boxSizing: 'border-box',
    color: parsedColor.isLight()
      ? 'rgba(0, 0, 0, 0.87)'
      : 'rgba(255, 255, 255, 0.87)',
    flexDirection: 'row',
    padding: theme.spacing(1, dense ? 1 : 3),
    textDecoration: 'none',
    transition: theme.transitions.create(['background-color', 'box-shadow'], {
      duration: theme.transitions.duration.short,
    }),

    '&:hover': {
      backgroundColor: parsedColor.darken(0.16).string(),
      boxShadow: theme.shadows[4],
    },

    '& .ColoredButton-icon': {
      lineHeight: 1,
      paddingRight: theme.spacing(0.5),
    },
  };

  if (fullWidth) {
    result.width = '100%';
  }

  return result;
});

const ColoredButton = ({ children, className, icon, ...rest }) => (
  <ColoredButtonBase focusRipple {...rest}>
    {icon && <div className='ColoredButton-icon'>{icon}</div>}
    <div className='ColoredButton-label'>{children}</div>
  </ColoredButtonBase>
);

ColoredButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  className: PropTypes.string,
  color: PropTypes.string,
  dense: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
};

export default ColoredButton;
