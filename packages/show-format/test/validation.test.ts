import {
  isValidCamera,
  isValidLightProgram,
  isValidPyroProgram,
  isValidShowSpecification,
  isValidTrajectory,
  isValidYawControl,
  validateLightProgram,
  validateShowSpecification,
} from '../dist/index.js';
import type { ShowSpecification } from '../dist/types.js';

import * as example from './fixtures/test-show.json';

function validate(object: any): asserts object is ShowSpecification {
  validateShowSpecification(object);
}

test('empty show specification', () => {
  expect(() => {
    validate({});
  }).toThrow(/no version/i);
});

test('invalid version number', () => {
  expect(() => {
    validate({ version: 123 });
  }).toThrow(/version/);
});

test('no swarm', () => {
  expect(() => {
    validate({ version: 1 });
  }).toThrow(/schema/);
});

test('no drones', () => {
  expect(() => {
    validate({ version: 1, swarm: {} });
  }).toThrow(/no drones/);
});

test('zero drones', () => {
  expect(() => {
    validate({ version: 1, swarm: { drones: [] } });
  }).toThrow(/no drones/);
});

test('too many drones', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: { drones: Array.from({ length: 10000 }) },
    });
  }).toThrow(/too many drones/i);
});

test('drone without trajectory', () => {
  expect(() => {
    validate({ version: 1, swarm: { drones: [{}] } });
  }).toThrow(/drone without trajectory/i);
});

test('drone with invalid trajectory', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: { drones: [{ settings: { trajectory: 123 } }] },
    });
  }).toThrow(/must be an object/i);
});

test('trajectory with invalid version', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: { drones: [{ settings: { trajectory: { version: 1234 } } }] },
    });
  }).toThrow(/version/i);
});

test('trajectory with invalid items', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: {
        drones: [
          {
            settings: {
              trajectory: { version: 1, points: 123 },
            },
          },
        ],
      },
    });
  }).toThrow(/schema/i);
});

test('trajectory with zero segments', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: {
        drones: [
          {
            settings: {
              trajectory: { version: 1, points: [] },
            },
          },
        ],
      },
    });
  }).toThrow(/schema/i);
});

test('trajectory with invalid takeoff time', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: {
        drones: [
          {
            settings: {
              trajectory: { version: 1, points: [], takeoffTime: 'foo' },
            },
          },
        ],
      },
    });
  }).toThrow(/schema/i);
});

test('trajectory with invalid landing time', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: {
        drones: [
          {
            settings: {
              trajectory: { version: 1, points: [], landingTime: 'foo' },
            },
          },
        ],
      },
    });
  }).toThrow(/schema/i);
});

test('invalid environment', () => {
  expect(() => {
    validate({ version: 1, swarm: example.swarm, environment: 'hell' });
  }).toThrow(/environment/);
});

test('invalid environment type', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: example.swarm,
      environment: { type: 'hell' },
    });
  }).toThrow(/environment type/);
});

test('invalid camera array', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: example.swarm,
      environment: { type: 'outdoor', cameras: 'foobar' },
    });
  }).toThrow(/must contain an array of cameras/);
});

test('invalid camera object', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: example.swarm,
      environment: { type: 'outdoor', cameras: [123] },
    });
  }).toThrow(/must be an object/);
});

test('invalid camera type', () => {
  expect(() => {
    validate({
      version: 1,
      swarm: example.swarm,
      environment: { type: 'outdoor', cameras: [{ type: 123 }] },
    });
  }).toThrow(/type must be a string/);
});

test('invalid camera position', () => {
  const camSpec = { position: [0, 2, Number.NaN] };
  const spec = {
    version: 1,
    swarm: example.swarm,
    environment: {
      type: 'outdoor',
      cameras: [camSpec],
    },
  };

  expect(() => {
    validate(spec);
  }).toThrow(/must be a numeric array of length 3/);

  camSpec.position = [0, 0];
  expect(() => {
    validate(spec);
  }).toThrow(/must be a numeric array of length 3/);

  (camSpec as any).position = '123';
  expect(() => {
    validate(spec);
  }).toThrow(/must be a numeric array of length 3/);
});

test('invalid camera orientation', () => {
  const camSpec = { orientation: [0, 0, 0, Number.POSITIVE_INFINITY] };
  const spec = {
    version: 1,
    swarm: example.swarm,
    environment: {
      type: 'outdoor',
      cameras: [camSpec],
    },
  };
  expect(() => {
    validate(spec);
  }).toThrow(/must be a numeric array of length 4/);

  camSpec.orientation = [0, 0, 0];
  expect(() => {
    validate(spec);
  }).toThrow(/must be a numeric array of length 4/);

  (camSpec as any).orientation = [0, 'foo', 0, 0];
  expect(() => {
    validate(spec);
  }).toThrow(/must be a numeric array of length 4/);

  (camSpec as any).orientation = null;
  expect(() => {
    validate(spec);
  }).toThrow(/must be a numeric array of length 4/);
});

test('camera without properties is still valid', () => {
  validate({
    version: 1,
    swarm: example.swarm,
    environment: { type: 'outdoor', cameras: [{}] },
  });
});

test('valid show file', () => {
  validate(example);
});

test('valid light program', () => {
  const { lights } = (example.swarm.drones[0] as any).settings;
  validateLightProgram(lights);
});

test('invalid light program', () => {
  expect(() => {
    validateLightProgram(null);
  }).toThrow(/must be an object/i);

  expect(() => {
    validateLightProgram({ version: 2, data: 'B6MQAA==' });
  }).toThrow(/version 1/i);

  expect(() => {
    validateLightProgram({ version: 1, data: 42 });
  }).toThrow(/schema mismatch/i);
});

test('isValidShowSpecification', () => {
  expect(isValidShowSpecification(example)).toBe(true);
  expect(isValidShowSpecification({})).toBe(false);
  expect(isValidShowSpecification(null)).toBe(false);
});

test('isValidCamera', () => {
  const { cameras } = example.environment as any;
  expect(isValidCamera(cameras[0])).toBe(true);
  expect(isValidCamera({ position: [1, 2] })).toBe(false);
  expect(isValidCamera(null)).toBe(false);
});

test('isValidLightProgram', () => {
  const { lights } = (example.swarm.drones[0] as any).settings;
  expect(isValidLightProgram(lights)).toBe(true);
  expect(isValidLightProgram({ version: 1 })).toBe(false);
  expect(isValidLightProgram(undefined)).toBe(false);
});

test('isValidPyroProgram', () => {
  expect(isValidPyroProgram({ version: 1, events: [], payloads: {} })).toBe(
    true
  );
  expect(isValidPyroProgram({ version: 1, events: 'yes' })).toBe(false);
  expect(isValidPyroProgram(null)).toBe(false);
});

test('isValidTrajectory', () => {
  const { trajectory } = (example.swarm.drones[0] as any).settings;
  expect(isValidTrajectory(trajectory)).toBe(true);
  expect(isValidTrajectory({ version: 1, points: [] })).toBe(false);
  expect(isValidTrajectory(undefined)).toBe(false);
});

test('isValidYawControl', () => {
  const { yawControl } = (example.swarm.drones[0] as any).settings;
  expect(isValidYawControl(yawControl)).toBe(true);
  expect(isValidYawControl({ version: 1, setpoints: 5 })).toBe(false);
  expect(isValidYawControl(null)).toBe(false);
});
