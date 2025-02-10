import { Bezier } from 'bezier-js';

import { iterPairs, slice } from './generators';
import { type Segment, SegmentedPlayerImpl } from './SegmentedPlayer';
import type {
  TimedBezierCurve,
  TimeWindow,
  Trajectory,
  TrajectorySegment,
  Vector3,
  Vector3Tuple,
} from './types';
import { validateTrajectory } from './validation';

/**
 * Type specification for a pair of functions that can be used to evaluate the
 * position and velocity at a given fraction of a trajectory segment.
 */
type PosVelEvaluator = [
  (result: Vector3, ratio: number) => void,
  (result: Vector3, ratio: number) => void
];

const _DEFAULT_SETPOINT: Vector3Tuple = [0, 0, 0];

/**
 * Class that takes a trajectory object as its first argument and that can
 * tell the position and velocity of the drone traversing the trajectory at any
 * given time instant.
 */
class TrajectoryPlayerImpl extends SegmentedPlayerImpl<
  Vector3Tuple,
  PosVelEvaluator,
  [Vector3Tuple[]]
> {
  /**
   * Constructor.
   *
   * @param trajectory  the trajectory to evaluate
   */
  constructor(trajectory: Trajectory) {
    validateTrajectory(trajectory);

    super(trajectory.points);
    this._shiftSegments(trajectory.takeoffTime ?? 0);
  }

  /**
   * Returns the position of the drone at the given time instant.
   *
   * @param time    the time instant, measured in seconds
   * @param result  the vector that should be updated with the position
   */
  getPositionAt(time: number, result: Vector3) {
    const ratio = this._seekTo(time);
    this._currentSegmentFunc[0](result, ratio);
    return result;
  }

  /**
   * Returns the velocity of the drone at the given time instant. If the
   * velocity is discontinuous at the time instant, the velocity "from the right"
   * takes precedence.
   *
   * @param time    the time instant, measured in seconds
   * @param result  the vector that should be updated with the velocity
   */
  getVelocityFromRightAt(time: number, result: Vector3) {
    const ratio = this._seekTo(time);
    this._currentSegmentFunc[1](result, ratio);
    return result;
  }

  protected override _createConstantSegmentFunctions(point: Vector3Tuple) {
    return createConstantSegmentFunctions(point);
  }

  protected override _createSegmentFunctions(
    [, start]: Segment<Vector3Tuple, [Vector3Tuple[]]>,
    [, end, controlPoints]: Segment<Vector3Tuple, [Vector3Tuple[]]>,
    dt: number
  ) {
    return createSegmentFunctions(start, end, controlPoints, dt);
  }

  protected override _getDefaultSetpoint(): Vector3Tuple {
    return _DEFAULT_SETPOINT;
  }
}

/**
 * Creates a position and a velocity function for a constant segment.
 */
function createConstantSegmentFunctions(point: Vector3Tuple): PosVelEvaluator {
  const [x, y, z] = point;

  return [
    function (vec: Vector3) {
      vec.x = x;
      vec.y = y;
      vec.z = z;
    },
    function (vec: Vector3) {
      vec.x = 0;
      vec.y = 0;
      vec.z = 0;
    },
  ];
}

/**
 * Creates a position and a velocity function for a linear segment between
 * the given start and end points with the given duration.
 */
function createLinearSegmentFunctions(
  start: Vector3Tuple,
  end: Vector3Tuple,
  dt: number
): PosVelEvaluator {
  const [x, y, z] = start;
  const dx = end[0] - x;
  const dy = end[1] - y;
  const dz = end[2] - z;

  const vx = dt > 0 ? dx / dt : 0;
  const vy = dt > 0 ? dy / dt : 0;
  const vz = dt > 0 ? dz / dt : 0;

  return [
    function (vec: Vector3, ratio: number) {
      vec.x = x + ratio * dx;
      vec.y = y + ratio * dy;
      vec.z = z + ratio * dz;
    },
    function (vec: Vector3) {
      vec.x = vx;
      vec.y = vy;
      vec.z = vz;
    },
  ];
}

/**
 * Creates a position and a velocity function for a Bézier curve segment with
 * the given duration.
 */
function createCurvedSegmentFunctions(
  curve: Bezier,
  dt: number
): PosVelEvaluator {
  return [
    function (vec, ratio) {
      // TODO(ntamas): find a way to avoid allocations!
      const result = curve.compute(ratio);
      vec.x = result.x;
      vec.y = result.y;
      vec.z = result.z;
    },
    dt !== 0
      ? function (vec, ratio) {
          const result = curve.derivative(ratio);
          vec.x = result.x / dt;
          vec.y = result.y / dt;
          vec.z = result.z / dt;
        }
      : // istanbul ignore next
        function (vec) {
          vec.x = 0;
          vec.y = 0;
          vec.z = 0;
        },
  ];
}

function createSegmentFunctions(
  start: Vector3Tuple,
  end: Vector3Tuple,
  controlPoints: Vector3Tuple[],
  dt: number
): PosVelEvaluator {
  if (Array.isArray(controlPoints) && controlPoints.length > 0) {
    if (controlPoints.length === 2) {
      const via1 = controlPoints[0];
      const via2 = controlPoints[1];
      const curve = new Bezier(
        start[0],
        start[1],
        start[2],
        via1[0],
        via1[1],
        via1[2],
        via2[0],
        via2[1],
        via2[2],
        end[0],
        end[1],
        end[2]
      );
      return createCurvedSegmentFunctions(curve, dt);
    }

    if (controlPoints.length === 1) {
      const via = controlPoints[0];
      const curve = new Bezier(
        start[0],
        start[1],
        start[2],
        via[0],
        via[1],
        via[2],
        end[0],
        end[1],
        end[2]
      );
      return createCurvedSegmentFunctions(curve, dt);
    }

    throw new Error('Only quadratic and cubic Bezier segments are supported');
  } else {
    return createLinearSegmentFunctions(start, end, dt);
  }
}

/**
 * Splits a Bezier curve into two sub-curves at a given fraction using
 * de Casteljau's algorithm.
 *
 * @param points The control points of the Bezier curve.
 * @param fraction The fraction at which to split the curve.
 *
 * @returns The control points of the two sub-curves.
 */
export function splitBezierCurve(
  points: Vector3Tuple[],
  fraction: number
): [Vector3Tuple[], Vector3Tuple[]] {
  const left: Vector3Tuple[] = [];
  const right: Vector3Tuple[] = [];
  const [t, oneMinusT] = [fraction, 1 - fraction];
  // De Casteljau's algorithm for calculating a curve point at a given t
  // also produces the control points of the two sub-curves that split the
  // original curve at t.
  // See: https://pomax.github.io/bezierinfo/#decasteljau and https://pomax.github.io/bezierinfo/#splitting
  let currentPoints = points;
  while (true) {
    const numPoints = currentPoints.length;
    left.push(currentPoints[0]);
    right.push(currentPoints[numPoints - 1]);
    if (numPoints < 2) {
      // We've reached the splitting point on the curve, so we can stop.
      break;
    }

    const newPoints: Vector3Tuple[] = [];
    for (let i = 0; i < numPoints - 1; i++) {
      // Calculate the splitting point for the current line.
      newPoints.push([
        oneMinusT * currentPoints[i][0] + t * currentPoints[i + 1][0],
        oneMinusT * currentPoints[i][1] + t * currentPoints[i + 1][1],
        oneMinusT * currentPoints[i][2] + t * currentPoints[i + 1][2],
      ]);
    }
    currentPoints = newPoints;
  }

  return [left, right.reverse()];
}

/**
 * Converts two consecutive `TrajectorySegment`s of a `Trajectory` to a `TimedBezierCurve` object.
 *
 * @param previous The previous segment in the trajectory.
 * @param current The current segment in the trajectory.
 *
 * @returns The created `TimedBezierCurve`.
 */
export function trajectorySegmentsToTimedBezierCurve(
  previous: TrajectorySegment,
  current: TrajectorySegment
): TimedBezierCurve {
  const duration = current[0] - previous[0];
  if (duration < 0) {
    throw new Error('Duration must be not be negative.');
  }

  return {
    startTime: previous[0],
    duration: current[0] - previous[0],
    points: [previous[1], ...current[2], current[1]],
  };
}

/**
 * Converts a `TimedBezierCurve` object to a `TrajectorySegment` object.
 *
 * Note: the first control point of the curve is lost during the transition, because
 * in the `TrajectorySegment` representation it is defined by the preceding segment.
 *
 * @param curve The curve to convert.
 *
 * @returns The trajectory segment corresponding to the curve.
 *
 * @throws `Error` if the curve has less than 2 control points.
 */
export function timedBezierCurveToTrajectorySegment(
  curve: TimedBezierCurve
): TrajectorySegment {
  const { duration, startTime, points } = curve;
  if (points.length < 2) {
    throw new Error('The curve must have at least 2 control points.');
  }

  // [end time of segment, endpoint of segment, additional control points ]
  // splice() first index is 1, because the first point is defined by the
  // previous segment (endpoint).
  return [startTime + duration, points.at(-1)!, points.slice(1, -1)];
}

/**
 * Splits the given curve at the given fraction (aka `t`) into two segments.
 *
 * @param curve The curve to split.
 * @param fraction The fraction at which to split the segment.
 *
 * @returns The two resulting curves.
 *
 * @throws `Error` if the fraction is not in the [0, 1] interval.
 */
export function splitTimedBezierCurve(
  curve: TimedBezierCurve,
  fraction: number
): [TimedBezierCurve, TimedBezierCurve] {
  if (fraction < 0 || fraction > 1) {
    throw new Error('fraction must be in the [0, 1] interval.');
  }

  const { startTime, duration, points } = curve;
  if (points.length < 2) {
    throw new Error('The curve must have at least 2 control points.');
  }

  if (fraction === 0) {
    return [
      { startTime, duration: 0, points: [points[0], points[0]] },
      { startTime, duration, points },
    ];
  } else if (fraction === 1) {
    return [
      { startTime, duration, points },
      {
        startTime: startTime + duration,
        duration: 0,
        points: [points[0], points.at(-1)!],
      },
    ];
  }

  const [left, right] = splitBezierCurve(points, fraction);
  const splitDuration = fraction * duration;

  return [
    { startTime, duration: splitDuration, points: left },
    {
      startTime: startTime + splitDuration,
      duration: duration - splitDuration,
      points: right,
    },
  ];
}

/**
 * Splits the given curve at a given time.
 *
 * This is just a wrapper around `splitTimedBezierCurve()` that takes a timestamp
 * instead of a fraction.
 *
 * @param curve The curve to split.
 * @param time The timestamp where the curve should be split.
 *
 * @returns The two resulting curves.
 *
 * @throws `Error` if the timestamp is outside the curve's time window.
 */
export function splitTimedBezierCurveAt(
  curve: TimedBezierCurve,
  time: number
): [TimedBezierCurve, TimedBezierCurve] {
  const fraction = (time - curve.startTime) / curve.duration;
  return splitTimedBezierCurve(curve, fraction);
}

/**
 * Calculates the trajectory segments for the part of the trajectory (given as an array of
 * `TrajectorySegment`s) that is within the given time window.
 *
 * @param segments The segments that define a valid trajectory.
 * @param timeWindow The time window the subtrajectory should be calculated for.
 *
 * @returns The trajectory segments for the subtrajectory.
 */
export function trajectorySegmentsInTimeWindow(
  segments: TrajectorySegment[],
  timeWindow: TimeWindow
): TrajectorySegment[] {
  const startTime = timeWindow.startTime;
  const endTime = timeWindow.startTime + timeWindow.duration;
  const result: TrajectorySegment[] = [];

  for (const [previous, current] of slice(
    iterPairs(segments),
    // Iterate only segments that overlap with the time window.
    ([, curr]) => curr[0] > startTime,
    ([prev]) => prev[0] > endTime
  )) {
    // Convert to a data representation that's easier to work with.
    let curve = trajectorySegmentsToTimedBezierCurve(previous, current);

    // Split at start time if needed.
    if (curve.startTime < startTime) {
      [, curve] = splitTimedBezierCurveAt(curve, startTime);
    }

    // Split at end time if needed.
    const curveEndTime = curve.startTime + curve.duration;
    if (curveEndTime > endTime) {
      [curve] = splitTimedBezierCurveAt(curve, endTime);
    }

    if (result.length === 0) {
      // Add the start point (necessary for the TrajectorySegment representation).
      result.push([startTime, curve.points[0], []]);
    }

    result.push(
      // Convert back to the original data representation.
      timedBezierCurveToTrajectorySegment(curve)
    );
  }

  return result;
}

export interface TrajectoryPlayer {
  getPositionAt: (time: number, result: Vector3) => Vector3;
  getVelocityAt: (time: number, result: Vector3) => Vector3;
  getVelocityFromRightAt: (time: number, result: Vector3) => Vector3;
}

/**
 * Factory function that creates a new trajectory player object with a
 * `getPositionAt()` function that evaluates the trajectory at a given
 * timestamp, and a `getVelocityAt()` function that evaluates the velocity
 * of a drone traversing the trajectory at a given timestamp.
 */
function createTrajectoryPlayer(trajectory: Trajectory): TrajectoryPlayer {
  const player = new TrajectoryPlayerImpl(trajectory);

  const getPositionAt = player.getPositionAt.bind(player);
  const getVelocityFromRightAt = player.getVelocityFromRightAt.bind(player);
  const getVelocityAt = getVelocityFromRightAt;

  return {
    getPositionAt,
    getVelocityAt,
    getVelocityFromRightAt,
  };
}

export default createTrajectoryPlayer;
