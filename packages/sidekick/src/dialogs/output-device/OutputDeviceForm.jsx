import PropTypes from 'prop-types';
import React from 'react';
import { Field, Form } from 'react-final-form';

import Box from '@mui/material/Box';

import BaudRateSelector from './BaudRateSelector';
import SerialPortSelector from './SerialPortSelector';

const validate = ({ baudRate, serialPort }) => {
  const result = {};
  const hasSerialPort = typeof serialPort === 'string' && serialPort.length > 0;

  if (
    hasSerialPort &&
    (typeof baudRate !== 'number' ||
      !Number.isFinite(baudRate) ||
      baudRate <= 0 ||
      !Number.isInteger(baudRate))
  ) {
    result.baudRate = 'Invalid baud rate';
  }

  return result;
};

const OutputDeviceForm = ({ initialValues, onSubmit }) => {
  return (
    <Form initialValues={initialValues} validate={validate} onSubmit={onSubmit}>
      {({ handleSubmit }) => (
        <form id='output-device-form' onSubmit={handleSubmit}>
          <Box pt={1}>
            <Field name='serialPort'>
              {({ input }) => <SerialPortSelector fullWidth {...input} />}
            </Field>
          </Box>
          <Box pt={1}>
            <Field name='baudRate'>
              {({ input }) => <BaudRateSelector fullWidth {...input} />}
            </Field>
          </Box>
        </form>
      )}
    </Form>
  );
};

OutputDeviceForm.propTypes = {
  initialValues: PropTypes.shape({
    serialPort: PropTypes.string,
    baudRate: PropTypes.number,
  }),
  onSubmit: PropTypes.func,
};

export default OutputDeviceForm;
