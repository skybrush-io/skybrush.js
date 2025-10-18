import { validateShowSpecification } from '../src';
import type { ShowSpecification } from '../src/types';

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
