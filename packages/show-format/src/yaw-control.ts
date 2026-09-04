import type { Vector3Coordinate } from '@skybrush/math';

import { type Segment, SegmentedPlayerImpl } from './SegmentedPlayer.js';
import type { Vector3 as Euler, StrideOptions, YawControl } from './types.js';
import { toRadians } from './utils.js';
import { validateYawControl } from './validation.js';

const _deprecationWarningsPrinted = {
  getYawAt: false,
  getYawsAt: false,
};

const degreeSegmentToRadianSegment = ([
  timestamp,
  rotationInDegrees,
  ...rest
]: Segment<number>): Segment<number> => [
  timestamp,
  toRadians(rotationInDegrees),
  ...rest,
];

/**
 * Type specification for a pair of functions that can be used to evaluate the
 * position and velocity at a given fraction of a yaw control segment.
 */
type YawEvaluator = [
  (result: Euler, ratio: number) => void,
  (result: Euler, ratio: number) => void,
];

/**
 * Class that takes a yaw control object as its first argument and that can
 * tell the horizontal alignment of the drone traversing the segment at any
 * given time instant.
 */
class YawControlPlayerImpl extends SegmentedPlayerImpl<number, YawEvaluator> {
  /** Helper vector used by some functions to avoid an allocation */
  _vec: Euler;

  /**
   * Constructor.
   *
   * @param yawControl  the yaw control object to evaluate. It is assumed that
   *        angles are specified in degrees in the yaw control object (according
   *        to Skybrush .skyc conventions), but they are converted to radians
   *        during initialization.
   */
  constructor(yawControl: YawControl) {
    validateYawControl(yawControl);

    super(
      yawControl.setpoints.map((segment) =>
        degreeSegmentToRadianSegment(segment)
      )
    );
    this._vec = { x: 0, y: 0, z: 0 };
  }

  /**
   * Returns the rotation of the drone at the given time instant.
   *
   * Angles are returned in radians.
   *
   * @param time    the time instant, measured in seconds
   * @param result  the vector that should be updated with the rotation
   */
  getPoseAt(time: number, result: Euler) {
    const ratio = this._seekTo(time);
    this._currentSegmentFunc[0](result, ratio);
    return result;
  }

  /**
   * Returns the rotation of the drone at multiple time instants.
   *
   * Angles are returned in radians.
   *
   * @param times   the time instants, measured in seconds
   * @param result  the array in which the rotations should be written
   * @param options options to configure the writing of the results into the result array
   */
  getPosesAt(
    times: Iterable<number>,
    result: Float32Array,
    options: StrideOptions = {}
  ) {
    const { start = 0, step = 3 } = options;

    let offset = start;
    for (const time of times) {
      const ratio = this._seekTo(time);
      this._currentSegmentFunc[0](this._vec, ratio);

      result[offset] = this._vec.x;
      result[offset + 1] = this._vec.y;
      result[offset + 2] = this._vec.z;

      offset += step;
    }
  }

  /**
   * Returns a single coordinate of the rotation of the drone at the given
   * time instant.
   *
   * Angles are returned in radians.
   *
   * @param time    the time instant, measured in seconds
   * @param key     the key of the coordinate to return ('x', 'y' or 'z')
   */
  getPoseCoordinateAt(time: number, key: Vector3Coordinate): number {
    const ratio = this._seekTo(time);
    this._currentSegmentFunc[0](this._vec, ratio);
    return this._vec[key];
  }

  /**
   * Returns a single coordinate of the rotation of the drone at multiple
   * time instants.
   *
   * Angles are returned in radians.
   *
   * @param times   the time instants, measured in seconds
   * @param key     the key of the coordinate to return ('x', 'y' or 'z')
   * @param result  the array in which the selected coordinate should be written
   * @param options options to configure the writing of the results into the result array
   */
  getPoseCoordinatesAt(
    times: Iterable<number>,
    key: Vector3Coordinate,
    result: Float32Array,
    options: StrideOptions = {}
  ) {
    const { start = 0, step = 1 } = options;

    let offset = start;
    for (const time of times) {
      const ratio = this._seekTo(time);
      this._currentSegmentFunc[0](this._vec, ratio);

      result[offset] = this._vec[key];

      offset += step;
    }
  }

  /**
   * Returns the angular velocity of the drone at the given time instant.
   * If the velocity is discontinuous at the time instant,
   * the velocity "from the right" takes precedence.
   *
   * Angular velocities are returned in radians per second.
   *
   * @param time    the time instant, measured in seconds
   * @param result  the vector that should be updated with the angular velocity
   */
  getAngularVelocityFromRightAt(time: number, result: Euler) {
    const ratio = this._seekTo(time);
    this._currentSegmentFunc[1](result, ratio);
    return result;
  }

  /**
   * Returns the angular velocity of the drone at multiple time instants. If
   * the velocity is discontinuous at a time instant, the velocity "from the
   * right" takes precedence.
   *
   * Angular velocities are returned in radians per second.
   *
   * @param times   the time instants, measured in seconds
   * @param result  the array in which the angular velocities should be written
   * @param options options to configure the writing of the results into the result array
   */
  getAngularVelocitiesFromRightAt(
    times: Iterable<number>,
    result: Float32Array,
    options: StrideOptions = {}
  ) {
    const { start = 0, step = 3 } = options;

    let offset = start;
    for (const time of times) {
      const ratio = this._seekTo(time);
      this._currentSegmentFunc[1](this._vec, ratio);

      result[offset] = this._vec.x;
      result[offset + 1] = this._vec.y;
      result[offset + 2] = this._vec.z;

      offset += step;
    }
  }

  protected override _createConstantSegmentFunctions(setpoint: number) {
    return createConstantSegmentFunctions(setpoint);
  }

  protected override _createSegmentFunctions(
    [, start]: Segment<number>,
    [, end]: Segment<number>,
    dt: number
  ) {
    return createSegmentFunctions(start, end, dt);
  }

  protected override _getDefaultSetpoint() {
    return 0;
  }
}

/**
 * Creates a yaw and an angular velocity function for a constant segment.
 */
function createConstantSegmentFunctions(setpoint: number): YawEvaluator {
  return [
    function (vec: Euler) {
      vec.z = setpoint;
    },
    function (vec: Euler) {
      vec.z = 0;
    },
  ];
}

/**
 * Creates a yaw and an angular velocity function for a linear segment
 * between the given start and end setpoints with the given duration.
 */
function createSegmentFunctions(
  start: number,
  end: number,
  dt: number
): YawEvaluator {
  const d = end - start;
  const v = dt > 0 ? d / dt : 0;

  return [
    function (vec: Euler, ratio: number) {
      vec.z = start + ratio * d;
    },
    function (vec: Euler) {
      vec.z = v;
    },
  ];
}

export type YawControlPlayer = {
  getPoseAt: (time: number, result: Euler) => Euler;
  getPosesAt: (
    times: Iterable<number>,
    result: Float32Array,
    options?: StrideOptions
  ) => void;
  getPoseCoordinateAt: (time: number, key: Vector3Coordinate) => number;
  getPoseCoordinatesAt: (
    times: Iterable<number>,
    key: Vector3Coordinate,
    result: Float32Array,
    options?: StrideOptions
  ) => void;
  getYawAt: (time: number, result: Euler) => Euler;
  getYawsAt: (
    times: Iterable<number>,
    result: Float32Array,
    options?: StrideOptions
  ) => void;
  getAngularVelocityAt: (time: number, result: Euler) => Euler;
  getAngularVelocitiesAt: (
    times: Iterable<number>,
    result: Float32Array,
    options?: StrideOptions
  ) => void;
  getAngularVelocityFromRightAt: (time: number, result: Euler) => Euler;
  getAngularVelocitiesFromRightAt: (
    times: Iterable<number>,
    result: Float32Array,
    options?: StrideOptions
  ) => void;
};

/**
 * Factory function that creates a new yaw control player object with a
 * `getPoseAt()` function that evaluates the yaw control at a given
 * timestamp, a `getPosesAt()` function that evaluates the yaw control at
 * multiple given timestamps, and a `getAngularVelocityAt()` function that
 * evaluates the angular velocity of a drone traversing the yaw control at a
 * given timestamp. `getYawAt()` and `getYawsAt()` are deprecated aliases
 * of `getPoseAt()` and `getPosesAt()`, respectively.
 */
/**
 * Deprecated backward compatibility wrapper around `getPoseAt()`. Prints a
 * deprecation warning on the first invocation only.
 */
function deprecatedGetYawAt(
  getPoseAt: (time: number, result: Euler) => Euler,
  time: number,
  result: Euler
) {
  if (!_deprecationWarningsPrinted.getYawAt) {
    _deprecationWarningsPrinted.getYawAt = true;
    console.warn('getYawAt() is deprecated. Use getPoseAt() instead.');
  }

  return getPoseAt(time, result);
}

/**
 * Deprecated backward compatibility wrapper around `getPosesAt()`. Prints a
 * deprecation warning on the first invocation only.
 */
function deprecatedGetYawsAt(
  getPosesAt: (
    times: Iterable<number>,
    result: Float32Array,
    options?: StrideOptions
  ) => void,
  times: Iterable<number>,
  result: Float32Array,
  options?: StrideOptions
) {
  if (!_deprecationWarningsPrinted.getYawsAt) {
    _deprecationWarningsPrinted.getYawsAt = true;
    console.warn('getYawsAt() is deprecated. Use getPosesAt() instead.');
  }

  getPosesAt(times, result, options);
}

function createYawControlPlayer(yawControl: YawControl): YawControlPlayer {
  const player = new YawControlPlayerImpl(yawControl);

  const getPoseAt = player.getPoseAt.bind(player);
  const getPosesAt = player.getPosesAt.bind(player);
  const getPoseCoordinateAt = player.getPoseCoordinateAt.bind(player);
  const getPoseCoordinatesAt = player.getPoseCoordinatesAt.bind(player);
  const getAngularVelocityFromRightAt =
    player.getAngularVelocityFromRightAt.bind(player);
  const getAngularVelocitiesFromRightAt =
    player.getAngularVelocitiesFromRightAt.bind(player);
  const getAngularVelocityAt = getAngularVelocityFromRightAt;
  const getAngularVelocitiesAt = getAngularVelocitiesFromRightAt;

  const getYawAt = (time: number, result: Euler) =>
    deprecatedGetYawAt(getPoseAt, time, result);
  const getYawsAt = (
    times: Iterable<number>,
    result: Float32Array,
    options?: StrideOptions
  ) => deprecatedGetYawsAt(getPosesAt, times, result, options);

  return {
    getPoseAt,
    getPosesAt,
    getPoseCoordinateAt,
    getPoseCoordinatesAt,
    getYawAt,
    getYawsAt,
    getAngularVelocityAt,
    getAngularVelocitiesAt,
    getAngularVelocityFromRightAt,
    getAngularVelocitiesFromRightAt,
  };
}

export default createYawControlPlayer;
