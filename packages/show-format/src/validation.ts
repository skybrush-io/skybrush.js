import { MAX_DRONE_COUNT } from './constants.js';
import {
  ENVIRONMENT_TYPES,
  EnvironmentType,
  type Camera,
  type ShowSpecification,
  type PyroProgram,
  type Trajectory,
  type YawControl,
} from './types.js';
import { isNil, isObject } from './utils.js';

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
  spec: unknown
): asserts spec is ShowSpecification {
  if (!isObject(spec)) {
    throw new TypeError('Show specification must be an object');
  }

  // TODO(ntamas): write a proper JSON-Schema specification for the show files
  // and use that.
  validateVersionInShowSpecification(spec);

  if (!isObject(spec.swarm)) {
    throw new TypeError('Show schema mismatch');
  }

  if (!Array.isArray(spec.swarm.drones) || spec.swarm.drones.length === 0) {
    throw new Error('Show specification contains no drones');
  }

  const drones: unknown[] = spec.swarm.drones;

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

    if (!isNil(drone.settings.pyro)) {
      validatePyroProgram(drone.settings.pyro);
    }

    validateTrajectory(drone.settings.trajectory);
  }

  if (spec.environment === undefined) {
    // TODO: A validation function shouldn't mutate input data...
    spec.environment = {};
  }

  const environment = spec.environment;

  if (!isObject(environment)) {
    throw new TypeError('Invalid environment in show specification');
  }

  if (environment.type === undefined) {
    // TODO: A validation function shouldn't mutate input data...
    environment.type = EnvironmentType.OUTDOOR;
  }

  if (!ENVIRONMENT_TYPES.includes(environment.type as EnvironmentType)) {
    throw new Error('Invalid environment type in show specification');
  }

  if (environment.cameras === undefined) {
    // TODO: A validation function shouldn't mutate input data...
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
export function validateCamera(camera: unknown): asserts camera is Camera {
  if (!isObject(camera)) {
    throw new TypeError('Camera must be an object');
  }

  const { type, position, orientation } = camera;

  if (type === undefined) {
    // TODO: A validation function shouldn't mutate input data...
    camera.type = 'perspective';
  } else if (typeof type !== 'string') {
    throw new TypeError('Camera type must be a string');
  }

  if (position === undefined) {
    // TODO: A validation function shouldn't mutate input data...
    camera.position = [0, 0, 0];
  } else if (
    !Array.isArray(position) ||
    position.length < 3 ||
    position.some((x) => typeof x !== 'number' || !Number.isFinite(x))
  ) {
    throw new TypeError('Camera position must be a numeric array of length 3');
  }

  if (orientation === undefined) {
    // TODO: A validation function shouldn't mutate input data...
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
 * Runs checks on an unknown input to see whether it looks like a valid pyro
 * program specification.
 *
 * Raises appropriate errors if the validation fails.
 *
 * @param pyroProgram  the specification to validate
 *
 * TODO: Writing these validator functions manually is way too tedious...
 *       Also, many of them are only partial and error-prone.
 *       Let's switch to a proper validation library, like `zod`!
 */
export function validatePyroProgram(
  pyroProgram: unknown
): asserts pyroProgram is PyroProgram {
  if (!isObject(pyroProgram)) {
    throw new TypeError('Pyro program must be an object');
  }

  if (pyroProgram.version !== 1) {
    throw new Error('Only version 1 pyro programs are supported');
  }

  if (!Array.isArray(pyroProgram.events)) {
    throw new TypeError('Pyro program schema mismatch');
  }

  if (
    pyroProgram.events.some(
      (event) =>
        !Array.isArray(event) ||
        typeof event[0] !== 'number' ||
        typeof event[1] !== 'number' ||
        typeof event[2] !== 'string'
    )
  ) {
    throw new TypeError('Pyro event schema mismatch');
  }

  if (!isObject(pyroProgram.payloads)) {
    throw new Error('Pyro program schema mismatch');
  }

  if (
    Object.values(pyroProgram.payloads).some(
      (payload) =>
        !isObject(payload) ||
        typeof payload.name !== 'string' ||
        (!isNil(payload.prefireTime) &&
          typeof payload.prefireTime !== 'number') ||
        (!isNil(payload.duration) && typeof payload.duration !== 'number') ||
        (!isNil(payload.yaw) && typeof payload.yaw !== 'number') ||
        (!isNil(payload.pitch) && typeof payload.pitch !== 'number')
    )
  ) {
    throw new TypeError('Pyro payload schema mismatch');
  }
}

/**
 * Runs some basic checks on a JSON-based trajectory specification to see
 * whether it looks like a valid trajectory specification.
 *
 * Raises appropriate errors if the trajectory specification
 * does not look like a valid one.
 *
 * @param trajectory  the specification to validate
 */
export function validateTrajectory(
  trajectory: unknown
): asserts trajectory is Trajectory {
  if (!isObject(trajectory)) {
    throw new TypeError('Trajectory must be an object');
  }

  if (trajectory.version !== 1) {
    throw new Error('Only version 1 trajectories are supported');
  }

  const items = trajectory.points;

  if (!Array.isArray(items) || items.length === 0) {
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

  if (!isNil(yawControl.autoYaw) && typeof yawControl.autoYaw !== 'boolean') {
    throw new TypeError('Yaw control schema mismatch');
  }

  if (
    !isNil(yawControl.autoYawOffset) &&
    typeof yawControl.autoYawOffset !== 'number'
  ) {
    throw new TypeError('Yaw control schema mismatch');
  }
}
