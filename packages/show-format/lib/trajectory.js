const { Bezier } = require('./bezier');
const { isNil } = require('./utils');
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
      beforeFirst: createConstantSegmentFunction(firstPoint),
      afterLast: createConstantSegmentFunction(lastPoint),
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
    let ratio;

    this._seekTo(time);

    if (this._currentSegmentLength > 0) {
      ratio =
        (time - this._currentSegmentStartTime) / this._currentSegmentLength;
    } else {
      ratio = 0;
    }

    this._currentSegmentFunc(result, ratio);
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
    if (time >= this._currentSegmentStartTime) {
      if (time <= this._currentSegmentEndTime) {
        // We are done.
        return;
      }

      if (this._segmentIndex < this._numSegments - 2) {
        // Maybe we only need to step to the next segment? This is the common
        // case.
        const nextEnd = this._startTimes[this._segmentIndex + 2];
        if (nextEnd >= time) {
          // We are done.
          this._selectSegment(this._segmentIndex + 1);
        }
      } else {
        // Reached the end of the trajectory
        this._selectSegment(this._numSegments);
      }
    }

    // Do things the hard way, with binary search
    const index = bisect(this._startTimes, time);
    this._selectSegment(index - 1);
  }

  /**
   *  Updates the state variables of the current trajectory if needed to ensure
   *  that the segmet with the given index is the one that is currently
   *  selected.
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
          this._segmentFuncs[index] = createSegmentFunction(
            this._currentSegment[0],
            this._segments[index + 1][0],
            this._segments[index + 1][1]
          );
        } else {
          this._segmentFuncs[index] = createConstantSegmentFunction(
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

function createConstantSegmentFunction(point) {
  const [x, y, z] = point;

  return function (vec) {
    vec.x = x;
    vec.y = y;
    vec.z = z;
  };
}

function createJumpSegmentFunction(start, end) {
  const [x, y, z] = start;
  const [endX, endY, endZ] = end;

  return function (vec, ratio) {
    if (ratio >= 1) {
      vec.x = endX;
      vec.y = endY;
      vec.z = endZ;
    } else {
      vec.x = x;
      vec.y = y;
      vec.z = z;
    }
  };
}

function createLinearSegmentFunction(start, end) {
  const [x, y, z] = start;
  const dx = end[0] - x;
  const dy = end[1] - y;
  const dz = end[2] - z;

  return function (vec, ratio) {
    vec.x = x + ratio * dx;
    vec.y = y + ratio * dy;
    vec.z = z + ratio * dz;
  };
}

function createCurvedSegmentFunction(curve) {
  return function (vec, ratio) {
    // TODO(ntamas): find a way to avoid allocations!
    const result = curve.compute(ratio);
    vec.x = result.x;
    vec.y = result.y;
    vec.z = result.z;
  };
}

function createSegmentFunction(start, end, controlPoints) {
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
      return createCurvedSegmentFunction(curve);
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
      return createCurvedSegmentFunction(curve);
    }

    throw new Error('Only quadratic and cubic Bezier segments are supported');
  } else if (isNil(controlPoints)) {
    return createJumpSegmentFunction(start, end);
  } else {
    return createLinearSegmentFunction(start, end);
  }
}

/**
 * Factory function that creates a new trajectory player object with a
 * single `getPositionAt()` function that evaluates the trajectory at a given
 * timestamp.
 */
function createTrajectoryPlayer(trajectory) {
  const player = new TrajectoryPlayer(trajectory);

  return {
    getPositionAt: player.getPositionAt.bind(player),
  };
}

module.exports = createTrajectoryPlayer;
