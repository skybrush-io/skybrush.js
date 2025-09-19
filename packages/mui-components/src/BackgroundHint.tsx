/**
 * @file Component that gives a hint to the user about the usage of the
 * application.
 */

import * as React from 'react';

import Box, { type BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const style = {
  display: 'flex',
  alignItems: 'center',
  color: 'text.secondary',
  fontSize: 'fontSize',
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
  height: '100%',
  userSelect: 'none',
} as const;

export interface BackgroundHintProps extends BoxProps {
  button?: React.ReactNode;
  header?: string;
  icon?: React.ReactElement;
  iconColor?: string;
  text?: string;
}

/**
 * Component that gives a hint to the user about the usage of the
 * application.
 *
 * The hint is presented as text in large print placed in the middle of
 * the area dedicated to the component.
 *
 * @return {Object} the rendered component
 */
const BackgroundHint = ({
  button,
  header,
  icon,
  iconColor,
  text,
  ...rest
}: BackgroundHintProps) => {
  const iconStyle: React.CSSProperties | undefined = icon
    ? {
        fontSize: 48,
      }
    : undefined;

  if (iconStyle && iconColor) {
    iconStyle.color = iconColor;
  }

  return (
    <Box sx={style} {...rest}>
      <div>
        {icon && (
          <Box pb={2}>{React.cloneElement(icon, { style: iconStyle })}</Box>
        )}
        {header && (
          <Typography variant='h6' sx={{ marginBottom: '16px' }}>
            {header}
          </Typography>
        )}
        <div>{text}</div>
        {button && <Box pt={2}>{button}</Box>}
      </div>
    </Box>
  );
};

export default BackgroundHint;
