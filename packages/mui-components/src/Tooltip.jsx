import React from 'react';
import Tippy from '@tippyjs/react';

import { useTheme } from '@material-ui/core/styles';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';

const customTouchHold = {
  fn(instance) {
    // Replicate the behavior of `on`, as it is not available for plugins:
    // https://github.com/atomiks/tippyjs/blob/ad85f6fe/src/createTippy.ts#L417
    const nodes = [].concat(instance.props.triggerTarget || instance.reference);

    for (const node of nodes) {
      node.addEventListener('touchstart', () => {
        instance.holdTimeout = setTimeout(() => {
          delete instance.holdTimeout;
          instance.show();
        }, 500);
      });

      node.addEventListener('touchend', (event) => {
        // Don't produce synthesised mouse events (`mouseenter`, `click`, etc.)
        event.preventDefault();

        // A hold has been interrupted before the set time threshold elapsed,
        // treat it as a regular click
        if (instance.holdTimeout) {
          event.target.dispatchEvent(
            new MouseEvent('click', { bubbles: true })
          );
          clearTimeout(instance.holdTimeout);
          delete instance.holdTimeout;
          instance.hide();
        }
      });
    }

    return {};
  },
};

/**
 * Tooltip component that adapts its appearance to the current Material UI
 * theme, depending on whether the theme is dark or light.
 */
const Tooltip = ({ mouseOnly, plugins, ...props }) => {
  const appTheme = useTheme();
  const tippyTheme =
    appTheme.palette.type === 'dark' ? 'dark-border' : 'light-border';
  return (
    <Tippy
      plugins={[...(mouseOnly ? [] : [customTouchHold]), ...(plugins || [])]}
      theme={tippyTheme}
      {...props}
    />
  );
};

export default Tooltip;
