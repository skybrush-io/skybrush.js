import memoize from 'lodash-es/memoize';
import range from 'lodash-es/range';
import sortedIndex from 'lodash-es/sortedIndex';
import mitt from 'mitt';

const PWM_MIN = 1000;
const PWM_MAX = 2000;
const PWM_MID = (PWM_MIN + PWM_MAX) / 2;

/**
 * Creates a button state tracker object that tracks the state of a set of
 * N buttons and dispatches events when a button gets pressed or released.
 *
 * The button state tracker can be updated with its `update()` method. The
 * button state tracker is also an event emitter so you can use `on()` and
 * `off()` to subscribe to and unsubscribe from events.
 */
export function createButtonStateTracker() {
  const emitter = mitt();
  const buttons = [];

  return {
    off: emitter.off.bind(emitter),
    on: emitter.on.bind(emitter),
    update: (newValues) => {
      const numberOfNewValues = newValues.length;

      if (buttons.length < numberOfNewValues) {
        buttons.length = numberOfNewValues;
      }

      for (let i = 0; i < numberOfNewValues; i++) {
        // TODO(ntamas): handle debouncing!
        if (newValues[i]) {
          if (buttons[i] === false) {
            emitter.emit('down', i);
          }
        } else if (buttons[i] === true) {
          emitter.emit('up', i);
        }

        buttons[i] = newValues[i] === true || newValues[i] >= 0.5;
      }
    },
  };
}

/**
 * Creates a scaler function that maps an input range to an output range
 * in a linear manner.
 */
const createScaler = ([fromMin, fromMax], [toMin, toMax]) => {
  const fromDiff = fromMax - fromMin;
  const toDiff = toMax - toMin;
  let intercept;

  if (fromDiff === 0) {
    intercept = toDiff / 2;
    return () => intercept;
  }

  const slope = (toMax - toMin) / (fromMax - fromMin);
  intercept = toMin - slope * fromMin;

  return (value) => value * slope + intercept;
};

/**
 * Scales an axis value from the range [-1, 1] to the typical RC channel
 * PWM range [1000, 2000].
 */
export const mapAxisToPwmRange = createScaler([-1, 1], [PWM_MIN, PWM_MAX]);

/**
 * Scales a button value from the range [0, 1] to the typical RC channel
 * PWM range [1000, 2000].
 */
export const mapButtonToPwmRange = createScaler([0, 1], [PWM_MIN, PWM_MAX]);

/**
 * Scales a button value from the range [0, 1] to a narrowed RC channel
 * PWM range [1165, 1825]. This is the range used by ArduCopter when it
 * calculates the thresholds for a 6-pos mode switch where the thresholds are
 * placed 150 units apart in this range as follows:
 *
 * 0 = [1000; 1230]; our midpoint will be 1165
 * 1 = [1231; 1360]; our midpoint will be 1294
 * 2 = [1361; 1490]; our midpoint will be 1426
 * 3 = [1491; 1620]; our midpoint will be 1558
 * 4 = [1621; 1750]; our midpoint will be 1690
 * 5 = [1751; 2000]; our midpoint will be 1822
 */
const mapButtonToNarrowPwmRange = createScaler(
  [0, 1],
  [PWM_MIN + 165, PWM_MAX - 175]
);

/**
 * Returns the preferred PWM values for an RC switch with the given number of
 * discrete states.
 */
const getValuesForStateCount = memoize(function (numberOfStates) {
  if (numberOfStates < 1) {
    throw new Error('need at least one state');
  } else if (numberOfStates === 1) {
    return [PWM_MID];
  } else {
    return range(0, numberOfStates).map((value) =>
      mapButtonToNarrowPwmRange(value / (numberOfStates - 1))
    );
  }
});

/**
 * Function that takes an input PWM value somewhere in the standard 1000-2000
 * PWM range, and the number of discrete states that an RC switch is assumed
 * to have, then figures out the most likely discrete state of the switch
 * given the input PWM value, and returns the PWM value of the next state.
 */
export function stepToNextDiscreteValue(value, numberOfStates, { wrap } = {}) {
  if (numberOfStates < 2) {
    return PWM_MID;
  }

  const values = getValuesForStateCount(numberOfStates);
  const index = sortedIndex(values, value);

  if (index >= numberOfStates - 1) {
    if (values[numberOfStates - 1] === value && wrap) {
      return values[0];
    }

    return values[numberOfStates - 1];
  }

  if (values[index] === value) {
    return values[index + 1];
  }

  return values[index];
}

/**
 * Function that takes an input PWM value somewhere in the standard 1000-2000
 * PWM range, and the number of discrete states that an RC switch is assumed
 * to have, then figures out the most likely discrete state of the switch
 * given the input PWM value, and returns the PWM value of the next state.
 */
export function stepToPreviousDiscreteValue(
  value,
  numberOfStates,
  { wrap } = {}
) {
  if (numberOfStates < 2) {
    return PWM_MID;
  }

  const values = getValuesForStateCount(numberOfStates);
  const index = sortedIndex(values, value);

  if (index > numberOfStates - 1) {
    return values[numberOfStates - 1];
  }

  if (index <= 0) {
    return values[0] === value && wrap ? values[numberOfStates - 1] : values[0];
  }

  return values[index - 1];
}
