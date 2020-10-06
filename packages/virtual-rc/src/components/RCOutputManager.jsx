import PropTypes from 'prop-types';
import React from 'react';
import { useRafLoop } from 'react-use';

const sendRCOutput = ({ fps, getter, sender }) => {
  let nextFrameAt = 0;
  const interval = 1000 / Math.min(Math.max(fps, 0.01), 60);

  return (timestamp) => {
    const delta = timestamp - nextFrameAt;

    if (delta > interval) {
      const values = getter();
      nextFrameAt = timestamp - (delta % interval);
      sender(values);
    }
  };
};

const RCOutputMainLoop = ({ fps, getter, sender }) => {
  useRafLoop(sendRCOutput({ fps, getter, sender }));
  return null;
};

RCOutputMainLoop.propTypes = {
  fps: PropTypes.number,
  getter: PropTypes.func.isRequired,
  sender: PropTypes.func.isRequired,
};

RCOutputMainLoop.defaultProps = {
  fps: 10,
};

const RCOutputManager = ({ enabled, ...props }) =>
  enabled && <RCOutputMainLoop {...props} />;

RCOutputManager.propTypes = {
  enabled: PropTypes.bool,
};

RCOutputManager.defaultProps = {
  enabled: true,
};

export default RCOutputManager;
