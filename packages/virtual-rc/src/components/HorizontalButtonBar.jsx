import PropTypes from 'prop-types';
import React from 'react';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

/**
 * Horizontal button bar that allows the user to select one from multiple
 * screens to navigate to.
 */
const HorizontalButtonBar = ({ buttons, onClick }) => {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
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
};

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
