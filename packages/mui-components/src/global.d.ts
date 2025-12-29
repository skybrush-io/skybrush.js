// This file is a workaround for
// https://github.com/mui/material-ui/issues/35287
//
// You can remove it when the underlying issue is resolved

export {};

declare global {
  namespace React {
    // We are extending an interface from React typings so we cannot use a type, therefore:
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface DOMAttributes<T> {
      onResize?: ReactEventHandler<T> | undefined;
      onResizeCapture?: ReactEventHandler<T> | undefined;
      nonce?: string | undefined;
    }
  }
}
