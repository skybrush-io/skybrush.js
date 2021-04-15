import isNil from 'lodash-es/isNil';
import PropTypes from 'prop-types';
import React from 'react';
import TimeAgo from 'react-timeago';

const NullSafeTimeAgo = (props) =>
  isNil(props.date) ? '\u2014' : <TimeAgo {...props} />;

NullSafeTimeAgo.propTypes = {
  date: PropTypes.number,
};

export default NullSafeTimeAgo;
