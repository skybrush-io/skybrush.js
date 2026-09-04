import { getTrajectoryDuration } from './trajectory.js';
import {
  EnvironmentType,
  type LightProgram,
  type PyroProgram,
  type ShowSpecification,
  type Trajectory,
  type YawControl,
} from './types.js';
import {
  isValidLightProgram,
  isValidPyroProgram,
  isValidTrajectory,
  isValidYawControl,
} from './validation.js';

/**
 * Returns the type of the environment (indoor or outdoor) of a show. Shows
 * that do not specify an environment type are considered to be outdoor
 * shows.
 */
export function getEnvironmentTypeFromSpecification(
  spec: ShowSpecification | null | undefined
): EnvironmentType {
  return spec?.environment?.type ?? EnvironmentType.OUTDOOR;
}

/**
 * Returns an array containing the trajectories of all the drones in the
 * swarm, in the same order as the drones themselves. The array contains
 * undefined for all the drones that have no valid fixed trajectory in the
 * show.
 */
export function getTrajectoriesFromSpecification(
  spec: ShowSpecification | null | undefined
): (Trajectory | undefined)[] {
  return (spec?.swarm?.drones ?? []).map((drone) => {
    const trajectory = drone?.settings?.trajectory;
    return isValidTrajectory(trajectory) ? trajectory : undefined;
  });
}

/**
 * Returns an array containing the light programs of all the drones in the
 * swarm, in the same order as the drones themselves. The array contains
 * undefined for all the drones that have no valid light program in the show.
 */
export function getLightProgramsFromSpecification(
  spec: ShowSpecification | null | undefined
): (LightProgram | undefined)[] {
  return (spec?.swarm?.drones ?? []).map((drone) => {
    const lightProgram = drone?.settings?.lights;
    return isValidLightProgram(lightProgram) ? lightProgram : undefined;
  });
}

/**
 * Returns an array containing the pyro programs of all the drones in the
 * swarm, in the same order as the drones themselves. The array contains
 * undefined for all the drones that have no valid pyro program in the show.
 */
export function getPyroProgramsFromSpecification(
  spec: ShowSpecification | null | undefined
): (PyroProgram | undefined)[] {
  return (spec?.swarm?.drones ?? []).map((drone) => {
    const pyroProgram = drone?.settings?.pyro;
    return isValidPyroProgram(pyroProgram) ? pyroProgram : undefined;
  });
}

/**
 * Returns an array containing the yaw controls of all the drones in the
 * swarm, in the same order as the drones themselves. The array contains
 * undefined for all the drones that have no valid yaw control data in the
 * show.
 */
export function getYawControlsFromSpecification(
  spec: ShowSpecification | null | undefined
): (YawControl | undefined)[] {
  return (spec?.swarm?.drones ?? []).map((drone) => {
    const yawControl = drone?.settings?.yawControl;
    return isValidYawControl(yawControl) ? yawControl : undefined;
  });
}

/**
 * Returns the total duration of the show, in seconds, calculated as the
 * duration of the longest trajectory in the swarm. Drones without a valid
 * trajectory are ignored.
 */
export function getShowDurationFromSpecification(
  spec: ShowSpecification | null | undefined
): number {
  let result = 0;

  for (const trajectory of getTrajectoriesFromSpecification(spec)) {
    if (trajectory !== undefined) {
      result = Math.max(result, getTrajectoryDuration(trajectory));
    }
  }

  return result;
}
