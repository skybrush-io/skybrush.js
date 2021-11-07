import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { useToggle } from 'react-use';

import TextField from '@mui/material/TextField';

import {
  getUAVIdSpecification,
  parseUAVIdSpecification,
} from '~/features/settings/selectors';
import { setUAVIdSpecification } from '~/features/settings/slice';
import { formatUAVIdSpecification } from '../../features/settings/selectors';

const UAVIdSpecificationEditor = ({ onChange, uavIdSpecification }) => {
  const [isValid, setValid] = useToggle(true);
  const [value, setValue] = useState(uavIdSpecification);

  const onValueChanged = useCallback(
    (event) => {
      const newValue = event.target.value;

      setValue(newValue);

      try {
        parseUAVIdSpecification(newValue);
        setValid(true);
      } catch {
        setValid(false);
      }
    },
    [setValid]
  );

  const onMaybeCommit = useCallback(() => {
    if (isValid) {
      const parsed = parseUAVIdSpecification(value);
      const normalizedValue = formatUAVIdSpecification(parsed);
      setValue(normalizedValue);
      onChange(normalizedValue);
    }
  }, [isValid, onChange, value]);

  return (
    <TextField
      fullWidth
      error={!isValid}
      label='Visible UAV IDs'
      variant='filled'
      helperText='Comma-separated IDs and ID ranges between 1 and 255, inclusive. Examples: 1-10, 16, 21-42.'
      value={value}
      onChange={onValueChanged}
      onBlur={onMaybeCommit}
    />
  );
};

UAVIdSpecificationEditor.propTypes = {
  onChange: PropTypes.func,
  uavIdSpecification: PropTypes.string,
};

export default connect(
  // mapStateToProps
  (state) => ({
    uavIdSpecification: getUAVIdSpecification(state),
  }),
  // mapDispatchToProps
  {
    onChange: setUAVIdSpecification,
  }
)(UAVIdSpecificationEditor);
