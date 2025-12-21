import Error from '@mui/icons-material/Error';
import Button from '@mui/material/Button';

import { useAsync } from '@react-hookz/web';
import React from 'react';

import BackgroundHint from './BackgroundHint.js';
import LargeProgressIndicator from './LargeProgressIndicator.js';

export interface AsyncGuardProps<T> {
  children: (value: T) => React.ReactNode;
  errorMessage?: string;
  func: () => Promise<T>;
  loadingMessage?: string;
  style?: React.CSSProperties;
}

function AsyncGuard<T>({
  children,
  func,
  errorMessage,
  loadingMessage,
  style,
}: AsyncGuardProps<T>) {
  // style prop is forwarded to make this component play nicely when it is used
  // as a top-level component in a transition

  const [state, actions, _] = useAsync(func);

  switch (state.status) {
    case 'error':
      return (
        <BackgroundHint
          icon={<Error />}
          text={errorMessage ?? 'An unexpected error happened'}
          button={
            <Button
              onClick={() => {
                actions.reset();
              }}
            >
              Try again
            </Button>
          }
          style={style}
        />
      );

    case 'loading':
    case 'not-executed':
      return (
        <LargeProgressIndicator
          fullHeight
          label={loadingMessage ?? 'Please wait, loading...'}
          style={style}
        />
      );

    case 'success':
      return children ? children(state.result!) : null;

    default:
      return null;
  }
}
