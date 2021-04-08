import arrify from 'arrify';
import isNil from 'lodash-es/isNil';

import { mavlink20 } from '@skybrush/mavlink/lib/dialects/v20/ardupilotmega';

/**
 * Known ArduPilot flight mode constants that we need.
 */
export const FlightMode = {
  LOITER: 5,
  RETURN_TO_HOME: 6,
  LAND: 9,
  POSITION_HOLD: 16,
  SHOW: 127,
};

/**
 * Magic constant used in ArduCopter COMPONENT_ARM_DISARM commands to force
 * arming or disarming.
 */
export const FORCE_MAGIC = 21196;

/**
 * Maximum allowe size of a MAVLink network.
 */
export const MAVLINK_NETWORK_SIZE = 256;

/**
 * Convenience method to create a MAVLink COMMAND_LONG message with a nicer
 * API than what the raw MAVLink module provides us.
 */
export const createCommandLong = ({
  targetSystem = 0,
  targetComponent = 0,
  command,
  confirmation = 0,
  params,
} = {}) => {
  if (isNil(command)) {
    throw new Error('Command must be provided');
  }

  params = arrify(params).concat();
  while (params.length < 7) {
    params.push(0);
  }

  params.length = 7;

  // eslint-disable-next-line new-cap
  return new mavlink20.messages.command_long(
    targetSystem,
    targetComponent,
    command,
    confirmation ? 1 : 0,
    ...params
  );
};

export function isValidMAVLinkId(id) {
  return (
    typeof id === 'number' &&
    id >= 1 &&
    id <= MAVLINK_NETWORK_SIZE &&
    Number.isInteger(id)
  );
}
