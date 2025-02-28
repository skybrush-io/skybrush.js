import test from 'ava';

import { validateShowSpecification } from '../src';
import type { ShowSpecification } from '../src/types';

import * as example from './fixtures/test-show.json';

function validate(object: any): asserts object is ShowSpecification {
  validateShowSpecification(object);
}

test('empty show specification', (t) => {
  t.throws(
    () => {
      validate({});
    },
    { message: /no version/i }
  );
});

test('invalid version number', (t) => {
  t.throws(
    () => {
      validate({ version: 123 });
    },
    { message: /version/ }
  );
});

test('no swarm', (t) => {
  t.throws(
    () => {
      validate({ version: 1 });
    },
    { message: /schema/ }
  );
});

test('no drones', (t) => {
  t.throws(
    () => {
      validate({ version: 1, swarm: {} });
    },
    { message: /no drones/ }
  );
});

test('zero drones', (t) => {
  t.throws(
    () => {
      validate({ version: 1, swarm: { drones: [] } });
    },
    { message: /no drones/ }
  );
});

test('too many drones', (t) => {
  t.throws(
    () => {
      validate({
        version: 1,
        swarm: { drones: Array.from({ length: 10000 }) },
      });
    },
    {
      message: /too many drones/i,
    }
  );
});

test('drone without trajectory', (t) => {
  t.throws(
    () => {
      validate({ version: 1, swarm: { drones: [{}] } });
    },
    {
      message: /drone without trajectory/i,
    }
  );
});

test('drone with invalid trajectory', (t) => {
  t.throws(
    () => {
      validate({
        version: 1,
        swarm: { drones: [{ settings: { trajectory: 123 } }] },
      });
    },
    {
      message: /must be an object/i,
    }
  );
});

test('trajectory with invalid version', (t) => {
  t.throws(
    () => {
      validate({
        version: 1,
        swarm: { drones: [{ settings: { trajectory: { version: 1234 } } }] },
      });
    },
    {
      message: /version/i,
    }
  );
});

test('trajectory with invalid items', (t) => {
  t.throws(
    () => {
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
    },
    {
      message: /schema/i,
    }
  );
});

test('trajectory with zero segments', (t) => {
  t.throws(
    () => {
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
    },
    {
      message: /schema/i,
    }
  );
});

test('trajectory with invalid takeoff time', (t) => {
  t.throws(
    () => {
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
    },
    {
      message: /schema/i,
    }
  );
});

test('trajectory with invalid landing time', (t) => {
  t.throws(
    () => {
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
    },
    {
      message: /schema/i,
    }
  );
});

test('invalid environment', (t) => {
  t.throws(
    () => {
      validate({ version: 1, swarm: example.swarm, environment: 'hell' });
    },
    { message: /environment/ }
  );
});

test('invalid environment type', (t) => {
  t.throws(
    () => {
      validate({
        version: 1,
        swarm: example.swarm,
        environment: { type: 'hell' },
      });
    },
    { message: /environment type/ }
  );
});

test('invalid camera array', (t) => {
  t.throws(
    () => {
      validate({
        version: 1,
        swarm: example.swarm,
        environment: { type: 'outdoor', cameras: 'foobar' },
      });
    },
    { message: /must contain an array of cameras/ }
  );
});

test('invalid camera object', (t) => {
  t.throws(
    () => {
      validate({
        version: 1,
        swarm: example.swarm,
        environment: { type: 'outdoor', cameras: [123] },
      });
    },
    { message: /must be an object/ }
  );
});

test('invalid camera type', (t) => {
  t.throws(
    () => {
      validate({
        version: 1,
        swarm: example.swarm,
        environment: { type: 'outdoor', cameras: [{ type: 123 }] },
      });
    },
    { message: /type must be a string/ }
  );
});

test('invalid camera position', (t) => {
  const camSpec = { position: [0, 2, Number.NaN] };
  const spec = {
    version: 1,
    swarm: example.swarm,
    environment: {
      type: 'outdoor',
      cameras: [camSpec],
    },
  };

  t.throws(
    () => {
      validate(spec);
    },
    {
      message: /must be a numeric array of length 3/,
    }
  );

  camSpec.position = [0, 0];
  t.throws(
    () => {
      validate(spec);
    },
    {
      message: /must be a numeric array of length 3/,
    }
  );

  (camSpec as any).position = '123';
  t.throws(
    () => {
      validate(spec);
    },
    {
      message: /must be a numeric array of length 3/,
    }
  );
});

test('invalid camera orientation', (t) => {
  const camSpec = { orientation: [0, 0, 0, Number.POSITIVE_INFINITY] };
  const spec = {
    version: 1,
    swarm: example.swarm,
    environment: {
      type: 'outdoor',
      cameras: [camSpec],
    },
  };
  t.throws(
    () => {
      validate(spec);
    },
    {
      message: /must be a numeric array of length 4/,
    }
  );

  camSpec.orientation = [0, 0, 0];
  t.throws(
    () => {
      validate(spec);
    },
    {
      message: /must be a numeric array of length 4/,
    }
  );

  (camSpec as any).orientation = [0, 'foo', 0, 0];
  t.throws(
    () => {
      validate(spec);
    },
    {
      message: /must be a numeric array of length 4/,
    }
  );

  (camSpec as any).orientation = null;
  t.throws(
    () => {
      validate(spec);
    },
    {
      message: /must be a numeric array of length 4/,
    }
  );
});

test('camera without properties is still valid', (t) => {
  validate({
    version: 1,
    swarm: example.swarm,
    environment: { type: 'outdoor', cameras: [{}] },
  });
  t.pass();
});

test('valid show file', (t) => {
  validate(example);
  t.pass();
});
