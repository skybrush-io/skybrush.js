const { MAX_DRONE_COUNT } = require('./constants');

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
  const { version } = spec;

  // TODO(ntamas): write a proper JSON-Schema specification for the show files
  // and use that.

  if (version === undefined) {
    throw new Error('No version number in specification');
  }

  if (version !== 1) {
    throw new Error('Only version 1 files are supported');
  }

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
      typeof drone.settings.trajectory !== 'object'
    ) {
      throw new Error('Found drone without trajectory in show specification');
    }

    if (drone.settings.trajectory.version !== 1) {
      throw new Error('Only version 1 trajectories are supported');
    }
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
}

module.exports = { validateShowSpecification };
