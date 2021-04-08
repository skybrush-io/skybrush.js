/**
 * @file Factory methods and other related functions to the commands that can
 * be sent to the drones from this application.
 */

import arrify from 'arrify';
import createColor from 'color';
import isNil from 'lodash-es/isNil';

import { mavlink20 } from '@skybrush/mavlink/lib/dialects/v20/ardupilotmega';

import { createCommandLong, FORCE_MAGIC, isValidMAVLinkId } from '~/ardupilot';

const createCommand = (type, args) => ({ type, args });

export const disarm = ({ force } = {}) => createCommand('disarm', { force });
export const flashColor = (color) =>
  createCommand('setColor', { color, duration: 1500, flash: true });
export const setColor = (color) =>
  createCommand('setColor', { color, duration: 60000, flash: false });
export const setFlightMode = (mode) => createCommand('setFlightMode', { mode });

const COMMAND_TO_MAVLINK_TABLE = {
  disarm: ({ force }) =>
    createCommandLong({
      command: mavlink20.MAV_CMD_COMPONENT_ARM_DISARM,
      params: [0 /* 0 = disarm, 1 = arm */, force ? FORCE_MAGIC : 0],
    }),

  setColor: ({ color, duration, flash }) => {
    const command = Array.from({ length: 24 }).fill(0);
    const commandLength = 6;

    color = createColor(color).rgb().array();
    duration = Math.floor(Math.max(duration, 0));

    command[0] = color[0];
    command[1] = color[1];
    command[2] = color[2];
    command[3] = duration & 0xff;
    command[4] = duration >> 8;
    command[5] = flash ? 2 /* blinking */ : 1 /* solid */;

    // eslint-disable-next-line new-cap
    return new mavlink20.messages.led_control(
      /* target_system */ 0,
      /* target_component */ 0,
      /* instance */ 42,
      /* pattern */ 42,
      /* custom_len */ commandLength,
      /* custom_bytes */ command
    );
  },

  setFlightMode: ({ mode }) =>
    createCommandLong({
      command: mavlink20.MAV_CMD_DO_SET_MODE,
      params: [mavlink20.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED, mode],
    }),
};

export function createMAVLinkMessagesFromCommand(command) {
  const { type, args, to } = command;
  if (!isNil(to) && !isValidMAVLinkId(to)) {
    console.warn(`Skipping invalid command target: ${to}`);
    return;
  }

  const func = COMMAND_TO_MAVLINK_TABLE[type];
  const messages = func ? arrify(func(args, type)) : [];

  // Re-write the target system and component of those messages that can have a
  // target (most messages that we need are like these)
  for (const message of messages) {
    if (Object.prototype.hasOwnProperty.call(message, 'target_system')) {
      /* eslint-disable camelcase */
      if (isNil(to)) {
        message.target_system = 0;
        message.target_component = 0;
      } else {
        message.target_system = to;
        message.target_component = mavlink20.MAV_COMP_ID_AUTOPILOT1;
      }
      /* eslint-enable camelcase */
    }
  }

  if (!func) {
    console.warn(`Unknown command type: ${type}`);
  }

  return messages;
}
