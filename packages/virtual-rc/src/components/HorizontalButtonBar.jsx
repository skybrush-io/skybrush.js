import PropTypes from 'prop-types';
import React from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

const style = {
  textAlign: 'center',
  '& > button': {
    margin: 1,
  },
};

/**
 * Horizontal button bar that allows the user to select one from multiple
 * screens to navigate to.
 */
const HorizontalButtonBar = ({ buttons, onClick }) => (
  <Container sx={style}>
    {buttons.map((button) => (
      <Button
        key={button.id}
        disabled={button.disabled}
        startIcon={button.icon}
        onClick={() => onClick(button.id)}
      >
        {button.label || button.id}
      </Button>
    ))}
  </Container>
);

HorizontalButtonBar.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      disabled: PropTypes.bool,
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      icon: PropTypes.node,
    })
  ),
  onClick: PropTypes.func,
};

export default HorizontalButtonBar;
