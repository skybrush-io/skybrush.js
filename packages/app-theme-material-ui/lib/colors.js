import createColor from 'color';
import { lightBlue, grey, green, yellow } from '@material-ui/core/colors';
import { Status } from './semantics';

/**
 * Enum containing commonly used semantic color names throughout Skybrush apps.
 */
export const Colors = {
  off: grey[700],
  error: '#f00',
  info: lightBlue[500],
  success: green.A700,
  warning: yellow[700],
  missing: '#f0f',

  dropTarget: 'rgba(3, 169, 244, 0.5)', // Lightblue.500

  axes: {
    x: '#f44',
    y: '#4f4',
    z: '#06f',
  },

  markers: {
    landing: '#3c3',
    origin: '#f44',
    takeoff: '#fc0',
  },
};

Colors.seriousWarning = createColor(Colors.warning)
  .mix(createColor(Colors.error))
  .string();

// Compatibility aliases
Colors.axisColors = Colors.axes;
Colors.landingMarker = Colors.markers.landing;
Colors.originMarker = Colors.markers.origin;
Colors.takeoffMarker = Colors.markers.takeoff;

/**
 * Mapping from semantic status codes to the corresponding colors.
 */
const statusColorMap = new Map([
  [Status.OFF, Colors.off],
  [Status.ERROR, Colors.error],
  [Status.INFO, Colors.info],
  [Status.SUCCESS, Colors.success],
  [Status.WARNING, Colors.warning],
  [Status.CRITICAL, Colors.seriousWarning],

  [Status.MISSING, Colors.missing],
  [Status.NEXT, Colors.info],
  [Status.WAITING, Colors.info],
  [Status.RTH, Colors.warning],
  [Status.SKIPPED, Colors.warning],
]);

/**
 * Returns an appropriate color for the given semantic status code.
 */
export const colorForStatus = (status) =>
  statusColorMap.has(status) ? statusColorMap.get(status) : Colors.missing;

export default Colors;
