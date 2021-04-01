import PropTypes from 'prop-types';
import React from 'react';

import { Status } from '@skybrush/app-theme-material-ui';
import SemanticAvatar from '@skybrush/mui-components/src/SemanticAvatar';

const DroneButton = ({ id, selected, ...rest }) => (
  <div {...rest}>
    <SemanticAvatar status={selected ? Status.NEXT : Status.OFF}>
      {id}
    </SemanticAvatar>
  </div>
);

DroneButton.propTypes = {
  id: PropTypes.number,
  selected: PropTypes.bool,
};

export default DroneButton;
