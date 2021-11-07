import React from 'react';
import Tippy from '@tippyjs/react';

import { useTheme } from '@mui/material/styles';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';

/**
 * Tooltip component that adapts its appearance to the current Material UI
 * theme, depending on whether the theme is dark or light.
 */
const Tooltip = (props) => {
  const appTheme = useTheme();
  const tippyTheme =
    appTheme.palette.mode === 'dark' ? 'dark-border' : 'light-border';
  return <Tippy theme={tippyTheme} {...props} />;
};

export default Tooltip;
