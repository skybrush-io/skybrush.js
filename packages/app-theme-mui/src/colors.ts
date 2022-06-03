/* eslint-disable @typescript-eslint/no-namespace */

import createColor from 'color';
import { lightBlue, grey, green, yellow } from '@mui/material/colors';
import { Status } from './semantics';

/**
 * Namespace containing commonly used semantic color names throughout Skybrush apps.
 */
export namespace Colors {
  export const off = grey[700];
  export const error = '#f00';
  export const info = lightBlue[500];
  export const success = green.A700;
  export const warning = yellow[700];
  export const missing = '#f0f';
  export const axes = {
    x: '#f44',
    y: '#4f4',
    z: '#06f',
  };
  export const markers = {
    landing: '#3c3',
    origin: '#f44',
    takeoff: '#fc0',
  };

  export const dropTarget = createColor(lightBlue[500]).alpha(0.5).string();
  export const seriousWarning = createColor(warning)
    .mix(createColor(error))
    .string();
}

/**
 * Mapping from semantic status codes to the corresponding colors.
 */
const statusColorMap = new Map([
  [Status.OFF, Colors.off],
  [Status.ERROR, Colors.error],
  [Status.INFO, Colors.info],
  [Status.SUCCESS, Colors.success],
  [Status.WARNING, Colors.warning],
  [Status.CRITICAL, Colors.error],

  [Status.MISSING, Colors.missing],
  [Status.NEXT, Colors.info],
  [Status.WAITING, Colors.info],
  [Status.RTH, Colors.warning],
  [Status.SKIPPED, Colors.warning],
]);

/**
 * Returns an appropriate color for the given semantic status code.
 */
export const colorForStatus = (status: Status): string =>
  statusColorMap.get(status) ?? Colors.missing;

export default Colors;
