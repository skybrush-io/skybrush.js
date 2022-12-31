import * as React from 'react';
import { useState } from 'react';
import Tippy, { type TippyProps } from '@tippyjs/react';

import { useTheme } from '@mui/material/styles';

export type LazyTooltipProps = TippyProps;

const LazyTooltip = (props: TippyProps) => {
  const appTheme = useTheme();
  const tippyTheme =
    appTheme.palette.mode === 'dark' ? 'dark-border' : 'light-border';
  const [mounted, setMounted] = useState(false);

  const lazyPlugin = {
    fn: () => ({
      onShow() {
        setMounted(true);
      },
      onHidden() {
        setMounted(false);
      },
    }),
  };

  const { render } = props;
  const computedProps = { ...props, theme: tippyTheme };

  computedProps.plugins = [lazyPlugin, ...(props.plugins ?? [])];

  if (render) {
    computedProps.render = (...args) => (mounted ? render(...args) : '');
  } else {
    computedProps.content = mounted ? props.content : '';
  }

  return <Tippy {...computedProps} />;
};

LazyTooltip.propTypes = Tippy.propTypes;

export default LazyTooltip;
