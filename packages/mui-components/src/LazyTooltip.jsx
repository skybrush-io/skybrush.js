import React, { useState } from 'react';

import { useTheme } from '@material-ui/core/styles';

import Tooltip from './Tooltip';

// Adapted from https://gist.github.com/atomiks/520f4b0c7b537202a23a3059d4eec908
const LazyTooltip = (props) => {
  const appTheme = useTheme();
  const tippyTheme =
    appTheme.palette.type === 'dark' ? 'dark-border' : 'light-border';
  const [mounted, setMounted] = useState(false);

  const lazyPlugin = {
    fn: () => ({
      onShow: () => setMounted(true),
      onHidden: () => setMounted(false),
    }),
  };

  const computedProps = { ...props, theme: tippyTheme };

  computedProps.plugins = [lazyPlugin, ...(props.plugins || [])];

  if (props.render) {
    computedProps.render = (...args) => (mounted ? props.render(...args) : '');
  } else {
    computedProps.content = mounted ? props.content : '';
  }

  return <Tooltip {...computedProps} />;
};

LazyTooltip.propTypes = Tooltip.propTypes;

export default LazyTooltip;
