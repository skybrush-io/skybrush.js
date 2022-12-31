import { Bezier } from 'bezier-js';

import type {
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

/**
 * Class that takes a trajectory object as its first argument and that can
 * tell the position and velocity of the drone traversing the trajectory at any
 * given time instant.
 */
class TrajectoryPlayerImpl {
  private readonly _takeoffTime: number;
  private readonly _numSegments: number;
  private readonly _segments: TrajectorySegment[];
  private readonly _startTimes: number[];
  private readonly _specialSegmentFuncs: {
    beforeFirst: PosVelEvaluator;
    afterLast: PosVelEvaluator;
  };

  private _segmentFuncs: Array<PosVelEvaluator | undefined>;

  private _currentSegment: TrajectorySegment | undefined;
  private _currentSegmentFunc: PosVelEvaluator;
  private _currentSegmentStartTime: number;
  private _currentSegmentEndTime: number;
  private _currentSegmentLength: number;
  private _segmentIndex: number;

  /**
   * Constructor.
   *
   * @param trajectory  the trajectory to evaluate
   */
  constructor(trajectory: Trajectory) {
    validateTrajectory(trajectory);

    const { points } = trajectory;

    this._takeoffTime = trajectory.takeoffTime ?? 0;
    this._numSegments = points.length;
    this._startTimes = points.map((item) => item[0] + this._takeoffTime);
    this._segments = [...points];

    const firstPoint: Vector3Tuple =
      this._numSegments > 0 ? this._segments[0][1] : [0, 0, 0];
    const lastPoint: Vector3Tuple =
      this._numSegments > 0
        ? this._segments[this._numSegments - 1][1]
        : [0, 0, 0];

    this._segmentFuncs = [];
    this._segmentFuncs.length = this._numSegments;

    this._specialSegmentFuncs = {
      beforeFirst: createConstantSegmentFunctions(firstPoint),
      afterLast: createConstantSegmentFunctions(lastPoint),
    };

    this._segmentIndex = 0;
    this._currentSegmentFunc = this._specialSegmentFuncs.beforeFirst;
    this._currentSegmentStartTime = Number.NEGATIVE_INFINITY;
    this._currentSegmentEndTime =
      this._numSegments > 0 ? this._startTimes[0] : Number.POSITIVE_INFINITY;
    this._currentSegmentLength = 0;

    this._reset();
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

  _reset() {
    this._selectSegment(-1);
  }

  /**
   * Updates the state variables of the current trajectory if needed to
   * ensure that its current segment includes the given time.
   *
   * @param  time  the timestamp to seek to
   */
  _seekTo(time: number) {
    let found = false;

    if (time >= this._currentSegmentStartTime) {
      if (time < this._currentSegmentEndTime) {
        // We are done. Note the strict comparison; this is to ensure that we
        // always return the velocity from the right side consistently.
        found = true;
      } else if (this._segmentIndex < this._numSegments - 2) {
        // Maybe we only need to step to the next segment? This is the common
        // case.
        const nextEnd = this._startTimes[this._segmentIndex + 2];
        if (nextEnd > time) {
          // We are done. Note the strict comparison; this is to ensure that we
          // always return the velocity from the right side consistently.
          this._selectSegment(this._segmentIndex + 1);
          found = true;
        }
      } else {
        // Reached the end of the trajectory
        this._selectSegment(this._numSegments);
        found = true;
      }
    }

    // Do things the hard way, with binary search
    if (!found) {
      const index = bisect(this._startTimes, time);
      this._selectSegment(index - 1);
    }

    // Return the relative time into the current segment
    if (this._currentSegmentLength > 0) {
      return (
        (time - this._currentSegmentStartTime) / this._currentSegmentLength
      );
    }

    return 0;
  }

  /**
   * Updates the state variables of the current trajectory if needed to ensure
   * that the segment with the given index is the one that is currently
   * selected.
   */
  _selectSegment(index: number) {
    this._segmentIndex = index;

    if (index < 0) {
      this._currentSegment = undefined;
      this._currentSegmentLength = 0;
      this._currentSegmentStartTime = Number.NEGATIVE_INFINITY;
      this._currentSegmentEndTime =
        this._numSegments > 0 ? this._startTimes[0] : Number.POSITIVE_INFINITY;
      this._currentSegmentFunc = this._specialSegmentFuncs.beforeFirst;
    } else if (index >= this._numSegments) {
      this._currentSegment = undefined;
      this._currentSegmentLength = 0;
      this._currentSegmentEndTime = Number.POSITIVE_INFINITY;
      /* istanbul ignore next */
      this._currentSegmentStartTime =
        this._numSegments > 0
          ? this._startTimes[this._numSegments - 1]
          : Number.NEGATIVE_INFINITY;
      this._currentSegmentFunc = this._specialSegmentFuncs.afterLast;
    } else {
      this._currentSegment = this._segments[index];
      this._currentSegmentStartTime = this._startTimes[index];

      if (index < this._numSegments - 1) {
        this._currentSegmentEndTime = this._startTimes[index + 1];
        this._currentSegmentLength =
          this._currentSegmentEndTime - this._currentSegmentStartTime;
      } else {
        this._currentSegmentEndTime = Number.POSITIVE_INFINITY;
        this._currentSegmentLength = 0;
      }

      if (!this._segmentFuncs[index]) {
        if (index < this._numSegments - 1) {
          this._segmentFuncs[index] = createSegmentFunctions(
            this._currentSegment[1],
            this._segments[index + 1][1],
            this._segments[index + 1][2],
            this._currentSegmentLength
          );
        } else {
          this._segmentFuncs[index] = createConstantSegmentFunctions(
            this._currentSegment[1]
          );
        }
      }

      this._currentSegmentFunc = this._segmentFuncs[index]!;
    }
  }
}

/**
 * Port of Python's `bisect.bisect` into JavaScript.
 */
function bisect<T>(items: T[], x: T, lo = 0, hi: number = items.length) {
  /* istanbul ignore if */
  if (lo < 0) {
    throw new Error('lo must be non-negative');
  }

  while (lo < hi) {
    const mid = Math.trunc((lo + hi) / 2);

    if (x < items[mid]) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  return lo;
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
