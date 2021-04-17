import PropTypes from 'prop-types';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

let warned = false;

const PreventDisplaySleepHelper = () => {
  useAsyncEffect(
    () => {
      if (window.bridge && window.bridge.preventDisplaySleep) {
        return window.bridge.preventDisplaySleep();
      }

      if (!warned) {
        console.warn(
          'window.bridge.preventDisplaySleep() is not available; cannot prevent sleeping'
        );
        warned = true;
      }
    },
    (token) => {
      if (token !== undefined && token !== null) {
        return window.bridge.restoreDisplaySleep(token);
      }
    },
    []
  );

  return null;
};

const PreventDisplaySleep = ({ active }) =>
  active ? <PreventDisplaySleepHelper /> : null;

PreventDisplaySleep.propTypes = {
  active: PropTypes.bool,
};

PreventDisplaySleep.defaultProps = {
  active: true,
};

export default PreventDisplaySleep;
