import { MAX_DRONE_COUNT } from './constants';
import { EnvironmentType, ENVIRONMENT_TYPES } from './types';
import type {
  Camera,
  ShowSpecification,
  Trajectory,
  YawControl,
} from './types';
import { isNil, isObject } from './utils';

/**
 * Validates the version number in the given show specification. Raises an
 * error if the version number is not suitable.
 *
 * @param spec  the specification to validate
 */
export function validateVersionInShowSpecification(
  spec: Record<string, unknown>
) {
  const { version } = spec;

  if (version === undefined) {
    throw new Error('No version number in specification');
  }

  if (version !== 1) {
    throw new Error('Only version 1 files are supported');
  }
}

/**
 * Runs some basic checks on a JSON-based show specification to see whether it
 * looks like a valid show specification.
 *
 * Raises appropriate errors if the show specification does not look like a
 * valid one.
 *
 * @param {object} spec  the specification to validate
 */
export function validateShowSpecification(
  spec: any
): asserts spec is ShowSpecification {
  // TODO(ntamas): write a proper JSON-Schema specification for the show files
  // and use that.
  validateVersionInShowSpecification(spec as Record<string, unknown>);

  if (!spec.swarm || !Array.isArray(spec.swarm.drones)) {
    throw new Error('Show specification contains no drones');
  }

  const drones: unknown[] = spec.swarm.drones as unknown[];

  if (drones.length > MAX_DRONE_COUNT) {
    throw new Error(
      `Too many drones in show file; maximum allowed is ${MAX_DRONE_COUNT}`
    );
  }

  for (const drone of drones) {
    if (
      !isObject(drone) ||
      !isObject(drone?.settings) ||
      isNil(drone.settings.trajectory)
    ) {
      throw new Error('Found drone without trajectory in show specification');
    }

    validateTrajectory(drone.settings.trajectory);
  }

  if (spec.environment === undefined) {
    spec.environment = {};
  } else if (!isObject(spec.environment)) {
    throw new TypeError('Invalid environment in show specification');
  }

  const environment: Record<string, unknown> = spec.environment as Record<
    string,
    unknown
  >;

  if (environment.type === undefined) {
    environment.type = EnvironmentType.OUTDOOR;
  }

  if (!ENVIRONMENT_TYPES.includes(environment.type as any as EnvironmentType)) {
    throw new Error('Invalid environment type in show specification');
  }

  if (environment.cameras === undefined) {
    environment.cameras = [];
  }

  if (!Array.isArray(environment.cameras)) {
    throw new TypeError('Environment must contain an array of cameras');
  }

  for (const camera of environment.cameras) {
    validateCamera(camera);
  }
}

/**
 * Runs some basic checks on a JSON-based camera specification to see whether
 * it looks like a valid camera specification.
 *
 * Raises appropriate errors if the camera specification does not look like a
 * valid one.
 *
 * @param camera  the specification to validate
 */
export function validateCamera(camera: any): asserts camera is Camera {
  if (!isObject(camera)) {
    throw new TypeError('Camera must be an object');
  }

  const { type, position, orientation } = camera;

  if (type === undefined) {
    camera.type = 'perspective';
  } else if (typeof type !== 'string') {
    throw new TypeError('Camera type must be a string');
  }

  if (position === undefined) {
    camera.position = [0, 0, 0];
  } else if (
    !Array.isArray(position) ||
    position.length < 3 ||
    position.some((x) => typeof x !== 'number' || !Number.isFinite(x))
  ) {
    throw new TypeError('Camera position must be a numeric array of length 3');
  }

  if (orientation === undefined) {
    camera.orientation = [1, 0, 0, 0];
  } else if (
    !Array.isArray(orientation) ||
    orientation.length < 4 ||
    orientation.some((x) => typeof x !== 'number' || !Number.isFinite(x))
  ) {
    throw new TypeError(
      'Camera orientation must be a numeric array of length 4'
    );
  }
}

/**
 * Runs some basic checks on a JSON-based trajectory specification to see
 * whether it looks like a valid trajectory specification.
 *
 * Raises appropriate errors if the trajectory specification does not look like a
 * valid one.
 *
 * @param trajectory  the specification to validate
 */
export function validateTrajectory(
  trajectory: any
): asserts trajectory is Trajectory {
  if (!isObject(trajectory)) {
    throw new TypeError('Trajectory must be an object');
  }

  if (trajectory.version !== 1) {
    throw new Error('Only version 1 trajectories are supported');
  }

  const items = trajectory.points;

  if (!Array.isArray(items)) {
    throw new TypeError('Trajectory schema mismatch');
  }

  if (
    !isNil(trajectory.takeoffTime) &&
    typeof trajectory.takeoffTime !== 'number'
  ) {
    throw new Error('Trajectory schema mismatch');
  }

  if (
    !isNil(trajectory.landingTime) &&
    typeof trajectory.landingTime !== 'number'
  ) {
    throw new Error('Trajectory schema mismatch');
  }
}

/**
 * Runs some basic checks on a JSON-based yaw control specification to see
 * whether it looks like a valid yaw control specification.
 *
 * Raises appropriate errors if the yaw control specification does not look like
 * a valid one.
 *
 * @param yawControl  the specification to validate
 */
export function validateYawControl(
  yawControl: unknown
): asserts yawControl is YawControl {
  if (!isObject(yawControl)) {
    throw new TypeError('Yaw control specification must be an object');
  }

  if (yawControl.version !== 1) {
    throw new Error('Only version 1 yaw control specifications are supported');
  }

  if (!Array.isArray(yawControl.setpoints)) {
    throw new TypeError('Yaw control schema mismatch');
  }

  if (typeof yawControl.autoYaw !== 'boolean') {
    throw new TypeError('Yaw control schema mismatch');
  }

  if (typeof yawControl.autoYawOffset !== 'number') {
    throw new TypeError('Yaw control schema mismatch');
  }
}
