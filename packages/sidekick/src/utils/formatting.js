import defaultFormatter from 'react-timeago/lib/defaultFormatter';

/**
 * Twitter-style short formatter for TimeAgo components
 */
export const shortTimeAgoFormatter = (value, unit) =>
  unit === 'month'
    ? `${value}mo`
    : unit === 'second' && value < 1
    ? 'now'
    : `${value}${unit.charAt(0)}`;

/**
 * Long formatter for TimeAgo components
 */
export const longTimeAgoFormatter = (value, unit, suffix, epochMs) =>
  unit === 'second' && value < 1
    ? '< 1 second ago'
    : defaultFormatter(value, unit, suffix, epochMs);
