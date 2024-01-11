import { type Segment, SegmentedPlayerImpl } from './SegmentedPlayer';
import type { Vector3 as Euler, YawControl } from './types';
import { toRadians } from './utils';
import { validateYawControl } from './validation';

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
  (result: Euler, ratio: number) => void
];

/**
 * Class that takes a yaw control object as its first argument and that can
 * tell the horizontal alignment of the drone traversing the yaw control at any
 * given time instant.
 */
class YawControlPlayerImpl extends SegmentedPlayerImpl<number, YawEvaluator> {
  /**
   * Constructor.
   *
   * @param yawControl  the yaw control to evaluate
   */
  constructor(yawControl: YawControl) {
    validateYawControl(yawControl);

    super(yawControl.setpoints.map(degreeSegmentToRadianSegment));
  }

  /**
   * Returns the yaw of the drone at the given time instant.
   *
   * @param time    the time instant, measured in seconds
   * @param result  the vector that should be updated with the rotation
   */
  getYawAt(time: number, result: Euler) {
    const ratio = this._seekTo(time);
    this._currentSegmentFunc[0](result, ratio);
    return result;
  }

  /**
   * Returns the angular velocity of the drone at the given time instant.
   * If the velocity is discontinuous at the time instant,
   * the velocity "from the right" takes precedence.
   *
   * @param time    the time instant, measured in seconds
   * @param result  the vector that should be updated with the angular velocity
   */
  getAngularVelocityFromRightAt(time: number, result: Euler) {
    const ratio = this._seekTo(time);
    this._currentSegmentFunc[1](result, ratio);
    return result;
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

export interface YawControlPlayer {
  getYawAt: (time: number, result: Euler) => Euler;
  getAngularVelocityAt: (time: number, result: Euler) => Euler;
  getAngularVelocityFromRightAt: (time: number, result: Euler) => Euler;
}

/**
 * Factory function that creates a new yaw control player object with a
 * `getYawAt()` function that evaluates the yaw control at a given
 * timestamp, and a `getAngularVelocityAt()` function that evaluates the
 * angular velocity of a drone traversing the yaw control at a given timestamp.
 */
function createYawControlPlayer(yawControl: YawControl): YawControlPlayer {
  const player = new YawControlPlayerImpl(yawControl);

  const getYawAt = player.getYawAt.bind(player);
  const getAngularVelocityFromRightAt =
    player.getAngularVelocityFromRightAt.bind(player);
  const getAngularVelocityAt = getAngularVelocityFromRightAt;

  return {
    getYawAt,
    getAngularVelocityAt,
    getAngularVelocityFromRightAt,
  };
}

export default createYawControlPlayer;
