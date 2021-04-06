import isNil from 'lodash-es/isNil';
import range from 'lodash-es/range';
import { createSelector } from '@reduxjs/toolkit';

/**
 * Returns the number of times each command should be repeated, irrespectively
 * of whether the repeating is enabled in general or not.
 */
export function getCommandRepeatCountEvenIfDisabled(state) {
  const { count } = getCommandRepeatingProperties(state);
  return typeof count === 'number' && count >= 1 && Number.isFinite(count)
    ? Math.floor(count)
    : 1;
}

/**
 * Returns the delay between repeated commands, irrespectively
 * of whether the repeating is enabled in general or not.
 */
export function getCommandRepeatDelayEvenIfDisabled(state) {
  const { delay } = getCommandRepeatingProperties(state);
  return typeof delay === 'number' && delay >= 0 && Number.isFinite(delay)
    ? delay
    : 0;
}

/**
 * Returns an object describing the generic command repeating properties from
 * the state store.
 */
function getCommandRepeatingProperties(state) {
  const { commands } = state.settings;
  const { repeat } = commands || {};
  return typeof repeat === 'object' && !isNil(repeat) ? repeat : {};
}

/**
 * Returns the properties of the output device preferred by the user.
 *
 * The returned object will have two properties: `serialPort` (the unique ID of
 * the port to connect to) and `baudRate` (the baud rate to use when opening
 * the port).
 */
export function getPreferredOutputDevice(state) {
  return {
    baudRate: 57600,
    serialPort: null,
    ...state.settings.preferredOutputDevice,
  };
}

/**
 * Returns the current UI theme to use.
 */
export function getTheme(state) {
  const { theme } = state.settings;
  return theme || 'auto';
}

/**
 * Returns whether command repeating is enabled.
 */
export function isCommandRepeatingEnabled(state) {
  const { enabled } = getCommandRepeatingProperties(state);
  return Boolean(enabled);
}

/**
 * Returns the string that specifies which UAV IDs are visible on the UI.
 */
export function getUAVIdSpecification(state) {
  const { uavIdSpec } = state.settings;
  return uavIdSpec || '1-250';
}

/**
 * Formats a UAV ID list specification from UAV ID ranges to a string.
 */
export function formatUAVIdSpecification(ranges) {
  const parts = [];
  for (const range of ranges) {
    if (range.length < 2) {
      continue;
    }

    const start = Math.floor(range[0]);
    const end = Math.floor(range[1]);
    if (end <= start) {
      continue;
    }

    if (end === start + 1) {
      parts.push(start);
    } else if (end === start + 2) {
      parts.push(start, start + 1);
    } else {
      parts.push(`${start}-${end - 1}`);
    }
  }

  return parts.join(', ');
}

/**
 * Parses a UAV ID list specification from string format to UAV ID ranges.
 *
 * The input string must consist of comma-separated entries; each entry may be
 * a single UAV ID or a range of UAV IDs specified as `from-to`.
 *
 * Raises an error if the string cannot be parsed.
 */
export function parseUAVIdSpecification(value) {
  if (typeof value !== 'string' || !/^[-\d, ]*$/.test(value)) {
    throw new Error('Parse error');
  }

  const parts = (value || '').split(',');
  const selected = [];
  const ranges = [];
  const MAVLINK_NETWORK_SIZE = 256;

  selected.length = MAVLINK_NETWORK_SIZE;
  for (let part of parts) {
    part = part.trim();
    if (part.length === 0) {
      continue;
    }

    const matches = part.match(/^(?<start>\d+)(-(?<end>\d*))?$/);
    if (!matches) {
      throw new Error('Parse error');
    }

    let startIndex = Number.parseInt(matches.groups.start, 10);
    if (startIndex < 0) {
      throw new Error('Parse error');
    }

    if (startIndex >= 256) {
      continue;
    }

    let endIndex =
      (typeof matches.groups.end === 'string' && matches.groups.end.length > 0
        ? Number.parseInt(matches.groups.end, 10)
        : startIndex) + 1;
    if (endIndex < 0) {
      throw new Error('Parse error');
    }

    endIndex = Math.min(endIndex, 256);
    while (startIndex < endIndex) {
      selected[startIndex] = true;
      startIndex++;
    }
  }

  // MAVLink ID zero is broadcast; this is not allowed
  selected[0] = false;

  // Add a sentinel element to the end
  selected.length = MAVLINK_NETWORK_SIZE;
  selected.push(false);

  // Convert the result boolean vector into an array of ranges
  let currentRange;
  for (let index = 0; index < MAVLINK_NETWORK_SIZE + 1; index++) {
    if (selected[index]) {
      if (currentRange === undefined) {
        // A new range starts here
        currentRange = [index, index + 1];
      } else {
        // The existing range continues
        currentRange[1]++;
      }
    } else if (currentRange !== undefined) {
      // The current range ends here
      ranges.push(currentRange);
      currentRange = undefined;
    }
  }

  return ranges;
}

/**
 * Selector that returns the list of UAV IDs to show in the main window of the
 * application.
 */
export const getVisibleUAVIds = createSelector(
  getUAVIdSpecification,
  (spec) => {
    const result = [];
    let ranges;

    try {
      ranges = parseUAVIdSpecification(spec);
    } catch {
      /* UAV ID specification invalid */
      ranges = [];
    }

    for (const rangeSpec of ranges) {
      const [start, end] = rangeSpec;
      result.push(...range(start, end));
    }

    return result;
  }
);
