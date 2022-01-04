import * as React from 'react';

import { styled } from '@mui/material/styles';

import Tooltip from './Tooltip';

export interface GenericHeaderButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  label?: React.ReactNode;
  secondaryLabel?: React.ReactNode;
  tooltip?: React.ReactNode;
}

const GenericHeaderButtonBase = styled('div', {
  shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ disabled, theme }) => ({
  color: 'white',
  cursor: 'default',
  minWidth: 48,
  opacity: disabled ? 0.25 : 1,
  padding: theme.spacing(0.5, 1),
  textOverflow: 'ellipsis',
  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.65)',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',

  '&:hover': {
    background: disabled
      ? 'none'
      : 'linear-gradient(to bottom, #06c 0%, #25a 100%)',
  },

  '& span.GenericHeaderButton-icon': {
    lineHeight: 0,
  },

  '& span.GenericHeaderButton-label': {
    margin: theme.spacing(0, 0.5, 0, 1),
    userSelect: 'none',
  },

  '& span.GenericHeaderButton-secondaryLabel': {
    color: 'rgba(255, 255, 255, 0.54)',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
}));

export const GenericHeaderButton = React.forwardRef(
  (
    {
      children,
      disabled,
      label,
      secondaryLabel,
      tooltip,
      ...rest
    }: GenericHeaderButtonProps,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const result = (
      <GenericHeaderButtonBase ref={ref} disabled={disabled} {...rest}>
        <span className='GenericHeaderButton-icon'>{children}</span>
        {label && (
          <span className='GenericHeaderButton-label'>
            {secondaryLabel ? (
              <>
                {label}
                <br />
                <span className='GenericHeaderButton-secondaryLabel'>
                  {secondaryLabel}
                </span>
              </>
            ) : (
              label
            )}
          </span>
        )}
      </GenericHeaderButtonBase>
    );

    if (tooltip) {
      return <Tooltip content={tooltip}>{result}</Tooltip>;
    }

    return result;
  }
);

export default GenericHeaderButton;
