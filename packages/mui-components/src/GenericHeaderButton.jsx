import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Tooltip from './Tooltip';

const useStyles = makeStyles(
  (theme) => ({
    root: {
      color: 'white',
      cursor: 'default',
      minWidth: 48,
      padding: theme.spacing(0.5, 1),
      textOverflow: 'ellipsis',
      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.65)',

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',

      '&:hover': {
        background: 'linear-gradient(to bottom, #06c 0%, #25a 100%)',
      },
    },

    disabled: {
      opacity: 0.25,
      '&:hover': {
        background: 'none !important',
      },
    },

    icon: {
      lineHeight: 0,
    },

    label: {
      margin: theme.spacing(0, 0.5, 0, 1),
      userSelect: 'none',
    },

    secondaryLabel: {
      color: 'rgba(255, 255, 255, 0.54)',
      userSelect: 'none',
      whiteSpace: 'nowrap',
    },
  }),
  {
    name: 'GenericHeaderButton',
  }
);

export const GenericHeaderButton = React.forwardRef(
  ({ children, disabled, label, secondaryLabel, tooltip, ...rest }, ref) => {
    const classes = useStyles();

    const result = (
      <div
        ref={ref}
        className={clsx(classes.root, disabled && classes.disabled)}
        {...rest}
      >
        <span className={classes.icon}>{children}</span>
        {label && (
          <span className={classes.label}>
            {secondaryLabel ? (
              <>
                {label}
                <br />
                <span className={classes.secondaryLabel}>{secondaryLabel}</span>
              </>
            ) : (
              label
            )}
          </span>
        )}
      </div>
    );

    if (tooltip) {
      return <Tooltip content={tooltip}>{result}</Tooltip>;
    }

    return result;
  }
);

GenericHeaderButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  secondaryLabel: PropTypes.string,
  tooltip: PropTypes.string,
};

export default GenericHeaderButton;
