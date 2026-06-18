// This file is a workaround for the fact that @mui/material-ui refers to
// a file in react-transition-group directly, without extension, but the
// TypeScript resolver wants to see the extension
//
// You can remove it when the underlying issue is resolved

declare module 'react-transition-group/Transition' {
  export * from 'react-transition-group/Transition.js';
}
