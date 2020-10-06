// Returns whether the app is running on macOS
export const isRunningOnMac =
  typeof navigator !== 'undefined'
    ? navigator.platform.includes('Mac')
    : typeof process !== 'undefined'
    ? process.platform === 'darwin'
    : false;
