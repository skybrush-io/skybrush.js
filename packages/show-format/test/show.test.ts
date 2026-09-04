import {
  EnvironmentType,
  getEnvironmentTypeFromSpecification,
  getLightProgramsFromSpecification,
  getPyroProgramsFromSpecification,
  getShowDurationFromSpecification,
  getTrajectoriesFromSpecification,
  getYawControlsFromSpecification,
} from '../dist/index.js';
import type { ShowSpecification } from '../dist/types.js';

import * as example from './fixtures/test-show.json';

const spec = example as unknown as ShowSpecification;

test('show duration', () => {
  // The fixture has a single drone with a trajectory ending at T=10
  expect(getShowDurationFromSpecification(spec)).toBe(10);
});

test('show duration with takeoff time', () => {
  const specWithTakeoff: ShowSpecification = JSON.parse(
    JSON.stringify(spec)
  ) as ShowSpecification;

  const drone = specWithTakeoff.swarm.drones[0] as any;
  drone.settings.trajectory = {
    ...drone.settings.trajectory,
    takeoffTime: 6,
  };

  expect(getShowDurationFromSpecification(specWithTakeoff)).toBe(16);
});

test('show duration with invalid or missing data', () => {
  const brokenSpec: ShowSpecification = JSON.parse(
    JSON.stringify(spec)
  ) as ShowSpecification;

  (brokenSpec.swarm.drones[0] as any).settings.trajectory = {
    version: 1,
    points: [],
  };

  expect(getShowDurationFromSpecification(brokenSpec)).toBe(0);
  expect(getShowDurationFromSpecification(undefined)).toBe(0);
  expect(getShowDurationFromSpecification(null)).toBe(0);
});

test('environment type', () => {
  // The fixture does not specify an environment type, so it is considered
  // to be an outdoor show
  expect(getEnvironmentTypeFromSpecification(spec)).toBe(
    EnvironmentType.OUTDOOR
  );

  const indoorSpec: ShowSpecification = JSON.parse(
    JSON.stringify(spec)
  ) as ShowSpecification;
  indoorSpec.environment.type = EnvironmentType.INDOOR;
  expect(getEnvironmentTypeFromSpecification(indoorSpec)).toBe(
    EnvironmentType.INDOOR
  );

  expect(getEnvironmentTypeFromSpecification(undefined)).toBe(
    EnvironmentType.OUTDOOR
  );
  expect(getEnvironmentTypeFromSpecification(null)).toBe(
    EnvironmentType.OUTDOOR
  );
});

test('per-drone settings extraction', () => {
  // The fixture has a single drone with a valid trajectory, light program
  // and yaw control, but no pyro program
  const trajectories = getTrajectoriesFromSpecification(spec);
  const lightPrograms = getLightProgramsFromSpecification(spec);
  const pyroPrograms = getPyroProgramsFromSpecification(spec);
  const yawControls = getYawControlsFromSpecification(spec);

  expect(trajectories).toHaveLength(1);
  expect(trajectories[0]).toBe((spec.swarm.drones[0] as any).settings.trajectory);
  expect(lightPrograms).toHaveLength(1);
  expect(lightPrograms[0]).toBe((spec.swarm.drones[0] as any).settings.lights);
  expect(pyroPrograms).toEqual([undefined]);
  expect(yawControls).toHaveLength(1);
  expect(yawControls[0]).toBe(
    (spec.swarm.drones[0] as any).settings.yawControl
  );
});

test('per-drone settings extraction with invalid data', () => {
  const brokenSpec: ShowSpecification = JSON.parse(
    JSON.stringify(spec)
  ) as ShowSpecification;

  const settings = (brokenSpec.swarm.drones[0] as any).settings;
  settings.trajectory = { version: 1, points: [] };
  settings.lights = { version: 1 };
  settings.yawControl = { version: 1, setpoints: 5 };

  expect(getTrajectoriesFromSpecification(brokenSpec)).toEqual([undefined]);
  expect(getLightProgramsFromSpecification(brokenSpec)).toEqual([undefined]);
  expect(getPyroProgramsFromSpecification(brokenSpec)).toEqual([undefined]);
  expect(getYawControlsFromSpecification(brokenSpec)).toEqual([undefined]);

  expect(getTrajectoriesFromSpecification(undefined)).toEqual([]);
  expect(getLightProgramsFromSpecification(null)).toEqual([]);
});
