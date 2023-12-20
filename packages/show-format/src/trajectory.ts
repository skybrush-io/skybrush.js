import { Bezier } from 'bezier-js';

import { Segment, SegmentedPlayerImpl } from './SegmentedPlayer';
import type { Trajectory, Vector3, Vector3Tuple } from './types';
import { validateTrajectory } from './validation';

/**
 * Type specification for a pair of functions that can be used to evaluate the
 * position and velocity at a given fraction of a trajectory segment.
 */
type PosVelEvaluator = [
  (result: Vector3, ratio: number) => void,
  (result: Vector3, ratio: number) => void
];

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

    const takeoffTime = trajectory.takeoffTime ?? 0;
    for (let i = 0; i < this._numSegments; i++) {
      this._startTimes[i] += takeoffTime;
    }
  }

  protected override _defaultSetpoint: Vector3Tuple = [0, 0, 0];

  protected override _createConstantSegmentFunctions(point: Vector3Tuple) {
    return createConstantSegmentFunctions(point);
  }

  protected override _createSegmentFunctions(
    [, start, controlPoints]: Segment<Vector3Tuple, [Vector3Tuple[]]>,
    [, end]: Segment<Vector3Tuple, [Vector3Tuple[]]>,
    dt: number
  ) {
    return createSegmentFunctions(start, end, controlPoints, dt);
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
