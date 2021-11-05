import PropTypes from 'prop-types';
import React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

const StyledLabel = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  flexDirection: 'row',
  lineHeight: '28px',
  overflow: 'hidden',
  margin: theme.spacing(0, 0.5),
  textAlign: 'right',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
}));

const RCSlider = ({ label, ...rest }) => (
  <>
    <Grid item xs={2} sm={1}>
      <StyledLabel>{label}</StyledLabel>
    </Grid>
    <Grid item xs={4} sm={2}>
      <Box
        height='100%'
        display='flex'
        flexDirection='row'
        alignItems='center'
        px={1}
      >
        <Slider {...rest} />
      </Box>
    </Grid>
  </>
);

RCSlider.propTypes = {
  label: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
};

RCSlider.defaultProps = {
  min: 1000,
  max: 2000,
};

const createChangeHandler = (callback, index) =>
  callback ? (_event, value) => callback(index, value) : undefined;

const RCChannelDisplay = ({ labels, onChangeChannel, values, ...rest }) => (
  <Box flex={1} p={2} overflow='auto'>
    <Grid container {...rest}>
      {labels.map((item, index) => (
        /* eslint-disable react/no-array-index-key */
        <RCSlider
          key={index}
          label={item}
          size='small'
          value={values[index]}
          onChange={createChangeHandler(onChangeChannel, index)}
        />
        /* eslint-enable react/no-array-index-key */
      ))}
    </Grid>
  </Box>
);

RCChannelDisplay.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string),
  onChangeChannel: PropTypes.func,
  values: PropTypes.arrayOf(PropTypes.number),
};

RCChannelDisplay.defaultProps = {
  labels: [],
  values: [],
};

export default RCChannelDisplay;
