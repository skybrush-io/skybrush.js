import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  label: {
    alignItems: 'center',
    flexDirection: 'row',
    lineHeight: '28px',
    overflow: 'hidden',
    margin: theme.spacing(0, 0.5),
    textAlign: 'right',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
}));

const RCSlider = ({ label, ...rest }) => {
  const classes = useStyles();
  return (
    <>
      <Grid item xs={2} sm={1}>
        <Box className={classes.label}>{label}</Box>
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
};

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
  <Box flex={1} p={2}>
    <Grid container {...rest}>
      {labels.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <RCSlider
          key={index}
          label={item}
          name={`ch${index}`}
          value={values[index]}
          onChange={createChangeHandler(onChangeChannel, index)}
        />
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
