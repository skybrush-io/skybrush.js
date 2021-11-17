const { MAX_DRONE_COUNT } = require('./constants');
const { isNil } = require('./utils');

/**
 * Validates the version number in the given show specification. Raises an
 * error if the version number is not suitable.
 *
 * @param {object} spec  the specification to validate
 */
function validateVersionInShowSpecification(spec) {
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
function validateShowSpecification(spec) {
  // TODO(ntamas): write a proper JSON-Schema specification for the show files
  // and use that.
  validateVersionInShowSpecification(spec);

  if (!spec.swarm || !Array.isArray(spec.swarm.drones)) {
    throw new Error('Show specification contains no drones');
  }

  const { drones } = spec.swarm;

  if (drones.length > MAX_DRONE_COUNT) {
    throw new Error(
      `Too many drones in show file; maximum allowed is ${MAX_DRONE_COUNT}`
    );
  }

  for (const drone of drones) {
    if (
      !drone.settings ||
      typeof drone.settings !== 'object' ||
      isNil(drone.settings.trajectory)
    ) {
      throw new Error('Found drone without trajectory in show specification');
    }

    validateTrajectory(drone.settings.trajectory);
  }

  if (spec.environment === undefined) {
    spec.environment = {};
  } else if (typeof spec.environment !== 'object') {
    throw new TypeError('Invalid environment in show specification');
  }

  const { environment } = spec;

  if (environment.type === undefined) {
    environment.type = 'outdoor';
  }

  if (!['outdoor', 'indoor'].includes(environment.type)) {
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
 * @param {object} camera  the specification to validate
 */
function validateCamera(camera) {
  if (typeof camera !== 'object') {
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
 * @param {object} trajectory  the specification to validate
 */
function validateTrajectory(trajectory) {
  if (typeof trajectory !== 'object') {
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

module.exports = {
  validateCamera,
  validateShowSpecification,
  validateTrajectory,
  validateVersionInShowSpecification,
};
