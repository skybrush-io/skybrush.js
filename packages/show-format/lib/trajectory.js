const { Bezier } = require('./bezier');
const { validateTrajectory } = require('./validation');

/**
 * Class that takes a trajectory object as its first argument and that can
 * tell the position of the drone traversing the trajeectoty at any given
 * time instant.
 */
class TrajectoryPlayer {
  /**
   * Constructor.
   *
   * @param {object} trajectory  the trajectory to evaluate, in Skybrush format
   */
  constructor(trajectory) {
    validateTrajectory(trajectory);

    const { points } = trajectory;

    this._takeoffTime = trajectory.takeoffTime || 0;
    this._numSegments = points.length;
    this._startTimes = points.map((item) => item[0] + this._takeoffTime);
    this._segments = points.map((item) => item.slice(1));

    const firstPoint = this._numSegments > 0 ? this._segments[0][0] : [0, 0, 0];
    const lastPoint =
      this._numSegments > 0
        ? this._segments[this._numSegments - 1][0]
        : [0, 0, 0];

    this._segmentFuncs = [];
    this._segmentFuncs.length = this._numSegments;

    this._specialSegmentFuncs = {
      beforeFirst: createConstantSegmentFunctions(firstPoint),
      afterLast: createConstantSegmentFunctions(lastPoint),
    };

    this._reset();
  }

  /**
   * Returns the position of the drone at the given time instant.
   *
   * @param {number}        time    the time instant, measured in seconds
   * @param {THREE.Vector}  result  the vector that should be updated with the
   *        position
   */
  getPositionAt(time, result) {
    const ratio = this._seekTo(time);
    this._currentSegmentFunc[0](result, ratio);
    return result;
  }

  /**
   * Returns the velocity of the drone at the given time instant. If the
   * velocity is discontinuous at the time instant, the velocity "from the right"
   * takes precedence.
   *
   * @param {number}        time    the time instant, measured in seconds
   * @param {THREE.Vector}  result  the vector that should be updated with the
   *        velocity
   */
  getVelocityFromRightAt(time, result) {
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
   * @param  {number} time  the timestamp to seek to
   */
  _seekTo(time) {
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
  _selectSegment(index) {
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
            this._currentSegment[0],
            this._segments[index + 1][0],
            this._segments[index + 1][1],
            this._currentSegmentLength
          );
        } else {
          this._segmentFuncs[index] = createConstantSegmentFunctions(
            this._currentSegment[0]
          );
        }
      }

      this._currentSegmentFunc = this._segmentFuncs[index];
    }
  }
}

/**
 * Port of Python's `bisect.bisect` into JavaScript.
 */
function bisect(items, x, lo = 0, hi = items.length) {
  /* istanbul ignore if */
  if (lo < 0) {
    throw new Error('lo must be non-negative');
  }

  while (lo < hi) {
    const mid = ((lo + hi) / 2) | 0;

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
function createConstantSegmentFunctions(point) {
  const [x, y, z] = point;

  return [
    function (vec) {
      vec.x = x;
      vec.y = y;
      vec.z = z;
    },
    function (vec) {
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
function createLinearSegmentFunctions(start, end, dt) {
  const [x, y, z] = start;
  const dx = end[0] - x;
  const dy = end[1] - y;
  const dz = end[2] - z;

  const vx = dt > 0 ? dx / dt : 0;
  const vy = dt > 0 ? dy / dt : 0;
  const vz = dt > 0 ? dz / dt : 0;

  return [
    function (vec, ratio) {
      vec.x = x + ratio * dx;
      vec.y = y + ratio * dy;
      vec.z = z + ratio * dz;
    },
    function (vec) {
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
function createCurvedSegmentFunctions(curve, dt) {
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

function createSegmentFunctions(start, end, controlPoints, dt) {
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
 * Factory function that creates a new trajectory player object with a
 * `getPositionAt()` function that evaluates the trajectory at a given
 * timestamp, and a `getVelocityAt()` function that evaluates the velocity
 * of a drone traversing the trajectory at a given timestamp.
 */
function createTrajectoryPlayer(trajectory) {
  const player = new TrajectoryPlayer(trajectory);

  const getPositionAt = player.getPositionAt.bind(player);
  const getVelocityFromRightAt = player.getVelocityFromRightAt.bind(player);
  const getVelocityAt = getVelocityFromRightAt;

  return {
    getPositionAt,
    getVelocityAt,
    getVelocityFromRightAt,
  };
}

module.exports = createTrajectoryPlayer;