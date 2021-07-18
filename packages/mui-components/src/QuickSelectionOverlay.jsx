import PropTypes from 'prop-types';
import React from 'react';

import Box from '@material-ui/core/Box';
import Portal from '@material-ui/core/Portal';
import { makeStyles } from '@material-ui/core/styles';

import { isThemeDark } from '@skybrush/app-theme-material-ui';

const useStyles = makeStyles((theme) => ({
  root: {
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },

  inner: {
    backdropFilter: 'blur(16px)',
    backgroundColor: isThemeDark(theme)
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    boxShadow: '0 0 32px rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 300,
    padding: theme.spacing(2),
    fontSize: theme.typography.h1.fontSize,
    textAlign: 'center',
  },
}));

const QuickSelectionOverlay = ({ text, open }) => {
  const classes = useStyles();
  return (
    open && (
      <Portal>
        <Box className={classes.root} zIndex='tooltip'>
          <Box className={classes.inner}>{text}</Box>
        </Box>
      </Portal>
    )
  );
};

QuickSelectionOverlay.propTypes = {
  open: PropTypes.bool,
  text: PropTypes.string,
};

export default QuickSelectionOverlay;
