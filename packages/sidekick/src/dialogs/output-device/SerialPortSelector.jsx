import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Refresh from '@mui/icons-material/Refresh';

import { refreshSerialPortList } from '~/features/output/actions';
import { getDetectedSerialPortList } from '~/features/output/selectors';

const SerialPortSelector = ({
  name,
  onBlur,
  onChange,
  onFocus,
  onRefresh,
  serialPorts,
  value,
  ...rest
}) => {
  return (
    <Box display='flex' flexDirection='row' alignItems='center'>
      <FormControl variant='filled' {...rest}>
        <InputLabel id='serial-port-selector-label'>Serial port</InputLabel>
        <Select
          labelId='serial-port-selector-label'
          id='serial-port-selector'
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          onFocus={onFocus}
        >
          <MenuItem value=''>
            <em>No port selected</em>
          </MenuItem>
          {serialPorts.map(({ portId, portName }) => (
            /* Even though we have portId and portName, we do not use portId as
             * the value for the select. This is because portId is ephemeral;
             * it changes the next time the app starts up, so it is unsuitable
             * for storing it in a permanent state store */
            <MenuItem key={portId} value={portName}>
              {portName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <IconButton edge='end' onClick={onRefresh} size="large">
        <Refresh />
      </IconButton>
    </Box>
  );
};

SerialPortSelector.propTypes = {
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onRefresh: PropTypes.func,
  serialPorts: PropTypes.arrayOf(
    PropTypes.shape({
      portId: PropTypes.string,
      portName: PropTypes.string,
    })
  ),
  value: PropTypes.string,
};

export default connect(
  // mapStateToProps
  (state) => ({
    serialPorts: getDetectedSerialPortList(state),
  }),
  // mapDispatchToProps
  {
    onRefresh: refreshSerialPortList,
  }
)(SerialPortSelector);
