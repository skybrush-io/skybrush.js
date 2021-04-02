import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

const SerialPortSelector = ({ serialPorts }) => {
  return null;
};

SerialPortSelector.propTypes = {
  serialPorts: PropTypes.arrayOf(
    PropTypes.shape({
      portId: PropTypes.string,
      portName: PropTypes.string,
    })
  ),
};

export default connect(
  // mapStateToProps
  (state) => ({
    serialPorts: getDetectedSerialPortList(state),
  }),
  // mapDispatchToProps
  {}
)(SerialPortSelector);
