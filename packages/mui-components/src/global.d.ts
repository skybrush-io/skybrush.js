// This file is a workaround for
// https://github.com/mui/material-ui/issues/35287
//
// You can remove it when the underlying issue is resolved

export {};

declare global {
  namespace React {
    interface DOMAttributes<T> {
      onResize?: ReactEventHandler<T> | undefined;
      onResizeCapture?: ReactEventHandler<T> | undefined;
      nonce?: string | undefined;
    }
  }
}
