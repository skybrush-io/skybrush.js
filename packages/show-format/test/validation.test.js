const {validateShowSpecification} = require('..');
const test = require('ava');

const validate = validateShowSpecification;

test('empty show specification', (t) => {
  t.throws(() => validate({}), {message: /no version/i});
});

test('invalid version number', (t) => {
  t.throws(() => validate({version: 123}), {message: /version/});
});

test('no drones', (t) => {
  t.throws(() => validate({version: 1}), {message: /no drones/});
});

test('too many drones', (t) => {
  t.throws(() => validate({version: 1, swarm: {drones: new Array(5000)}}), {
    message: /too many drones/i
  });
});

test('drone without trajectory', (t) => {
  t.throws(() => validate({version: 1, swarm: {drones: [{}]}}), {
    message: /drone without trajectory/i
  });
});

test('trajectory with invalid version', (t) => {
  t.throws(
    () =>
      validate({
        version: 1,
        swarm: {drones: [{settings: {trajectory: {version: 1234}}}]}
      }),
    {
      message: /version/i
    }
  );
});

test('invalid environment', (t) => {
  t.throws(() =>
    validate(
      {version: 1, swarm: {drones: []}, environment: 'hell'},
      {message: /environment/}
    )
  );
});

test('invalid environment type', (t) => {
  t.throws(() =>
    validate(
      {version: 1, swarm: {drones: []}, environment: {type: 'hell'}},
      {message: /environment type/}
    )
  );
});

test('valid show file', (t) => {
  const spec = require('./fixtures/test-show');
  validate(spec);
  t.pass();
});
