import PropTypes from 'prop-types';
import React from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { isThemeDark } from '@skybrush/app-theme-material-ui';

import lightLogo from '~/../assets/img/logo.png';
import darkLogo from '~/../assets/img/logo-dark.png';

const logos = {
  light: lightLogo,
  dark: darkLogo
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
});

const SkybrushLogo = React.memo(({ height, style, url, width, ...rest }) => {
  const classes = useStyles();
  const theme = useTheme();
  const imageStyle = {};
  const boxStyle = { ...style };
  const navigateToUrl = url
    ? () => {
        window.location.href = url;
      }
    : undefined;

  if (width !== undefined) {
    imageStyle.width = width;
  }

  if (height !== undefined) {
    imageStyle.height = height;
  }

  if (url) {
    boxStyle.cursor = 'pointer';
  }

  return (
    <Box
      className={classes.root}
      style={boxStyle}
      onClick={navigateToUrl}
      {...rest}
    >
      <img
        src={isThemeDark(theme) ? logos.dark : logos.light}
        alt='Skybrush Virtual RC'
        style={imageStyle}
      />
    </Box>
  );
});

SkybrushLogo.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  url: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

SkybrushLogo.defaultProps = {
  width: 160,
  height: 'auto',
  url: 'https://skybrush.io',
};

export default SkybrushLogo;
