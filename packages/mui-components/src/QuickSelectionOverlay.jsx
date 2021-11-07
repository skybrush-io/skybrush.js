import PropTypes from 'prop-types';
import React from 'react';

import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';

import { isThemeDark } from '@skybrush/app-theme-mui';

const styles = {
  root: {
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 'tooltip',
  },

  inner: {
    backdropFilter: 'blur(16px)',
    backgroundColor: (theme) =>
      isThemeDark(theme) ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    boxShadow: '0 0 32px rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 300,
    padding: 2,
    fontSize: 'h1.fontSize',
    textAlign: 'center',
  },
};

const QuickSelectionOverlay = ({ text, open }) =>
  open && (
    <Portal>
      <Box sx={styles.root}>
        <Box sx={styles.inner}>{text}</Box>
      </Box>
    </Portal>
  );

QuickSelectionOverlay.propTypes = {
  open: PropTypes.bool,
  text: PropTypes.string,
};

export default QuickSelectionOverlay;
