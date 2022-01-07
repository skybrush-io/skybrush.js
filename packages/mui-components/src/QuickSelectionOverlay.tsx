import * as React from 'react';

import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';
import { Theme } from '@mui/material/styles';

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
    backgroundColor: (theme: Theme) =>
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
} as const;

export interface QuickSelectionOverlayProps {
  text: string | number;
  open: boolean;
}

const QuickSelectionOverlay = ({ text, open }: QuickSelectionOverlayProps) =>
  open ? (
    <Portal>
      <Box sx={styles.root}>
        <Box sx={styles.inner}>{text}</Box>
      </Box>
    </Portal>
  ) : null;

export default QuickSelectionOverlay;
