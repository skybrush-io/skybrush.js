import Denque from 'denque';
import { atob } from 'js-base64';

import type { Color, LightProgram } from './types';
import { isArrayBuffer, isObject } from './utils';

interface LightProgramExecutor {
  execute: () => Generator<ExecutorState, void, void>;
  reset: () => void;
}

export interface LightProgramPlayer {
  evaluateColorAt: (seconds: number, color: Color) => void;
  iterate: (fps?: number) => Generator<[number, Color], void, void>;
}

export type LightProgramLike = string | LightProgram | ArrayBuffer | undefined;
type LoopItem = [number, number];

/**
 * Helper function that takes a base64-encoded string or an ArrayBuffer and
 * converts it into an Uint8Array.
 *
 * Also accepts Uint8Array objects as an input; returns the array intact if
 * this is the case.
 */
function convertLightProgramToUint8Array(input: LightProgramLike): Uint8Array {
  if (isArrayBuffer(input)) {
    return new Uint8Array(input);
  }

  if (input instanceof Uint8Array) {
    return input;
  }

  if (isObject(input)) {
    const { version, data } = input;

    if (version !== 1) {
      throw new Error('Only version 1 light programs are supported');
    }

    return convertLightProgramToUint8Array(data as any as LightProgramLike);
  }

  if (typeof input === 'string') {
    return Uint8Array.from(atob(input), (char) => char.codePointAt(0) ?? 0);
  }

  if (input === undefined) {
    // Just use constant white. 7 = SET WHITE, 127 = duration: 127 * 20 msec
    return Uint8Array.from([7, 127]);
  }

  throw new Error('Unsupported input type for light program');
}

/**
 * State object for the light program executor. The state object essentially
 * covers a time interval in the execution and it consists of the following
 * components:
 *
 * - a timestamp
 * - a duration
 * - a start color that is valid at the given timestamp
 * - an optional end color; if it is specified, there is a fade from the given
 *   timestamp with the given duration, from the start color to the end color.
 *   If it is missing, the color is constant for the entire time interval.
 *
 * When the state is initialized, the timestamp is set to zero, the duration is
 * set to zero and the start color is set to black.
 */
class ExecutorState {
  timestamp: number;
  duration: number;
  endTime: number;

  private _startColor: Color;
  private _endColor: Color;
  private _isFade: boolean;

  /**
   * Constructor.
   */
  constructor() {
    this._startColor = [0, 0, 0];
    this._endColor = [0, 0, 0];
    this._isFade = false;

    this.timestamp = 0;
    this.duration = 0;
    this.endTime = 0;
  }

  /**
   * Advances the state object with the given duration. Also copies the end
   * color to the start color if the previous state represented a fade.
   *
   * Returns the state object for easy chainability.
   */
  advanceTimeBy(duration: number): this {
    let i;

    this.timestamp = this.endTime;
    this.duration = duration;
    this.endTime = this.timestamp + duration;

    if (this._isFade) {
      for (i = 0; i < 3; i++) {
        this._startColor[i] = this._endColor[i];
      }

      this._isFade = false;
    }

    return this;
  }

  /**
   * Returns whether the slice contains the given timestamp.
   */
  containsTime(time: number): boolean {
    return time >= this.timestamp && time <= this.endTime;
  }

  /**
   * Returns an exact copy of this state object.
   */
  copy(): ExecutorState {
    const result = new ExecutorState();

    result.timestamp = this.timestamp;
    result.duration = this.duration;
    result.endTime = this.endTime;

    result._startColor = [...this._startColor];
    result._endColor = [...this._endColor];
    result._isFade = this._isFade;

    return result;
  }

  /**
   * Returns the color at the given timestamp according to this state object.
   * The timestamp is assumed to be within the time range spanned by the
   * state object.
   */
  evaluateColorAt<T extends Color>(timestamp: number, color: T): T {
    let i;

    if (this._isFade) {
      const ratio =
        this.duration > 0 ? (timestamp - this.timestamp) / this.duration : 0;
      for (i = 0; i < 3; i++) {
        color[i] =
          (1 - ratio) * this._startColor[i] + ratio * this._endColor[i];
      }
    } else {
      for (i = 0; i < 3; i++) {
        color[i] = this._startColor[i];
      }
    }

    return color;
  }

  /**
   * Sets the state object to represent a fade from the current color to the
   * given color during a given duration.
   *
   * Returns the state object for easy chainability.
   */
  fadeToColor(color: Color, duration: number): this {
    this.advanceTimeBy(duration);

    for (let i = 0; i < 3; i++) {
      this._endColor[i] = color[i];
    }

    this._isFade = true;

    return this;
  }

  /**
   * Sets the state object to represent a fade from the current color to the
   * given gray color during a given duration.
   *
   * Returns the state object for easy chainability.
   */
  fadeToGray(grayLevel: number, duration: number): this {
    this.advanceTimeBy(duration);

    for (let i = 0; i < 3; i++) {
      this._endColor[i] = grayLevel;
    }

    this._isFade = true;

    return this;
  }

  /**
   * Scales the components of the colors in this slice uniformly with the
   * given multiplier.
   */
  scaleColorsBy(factor: number): void {
    for (let i = 0; i < 3; i++) {
      this._startColor[i] *= factor;
      this._endColor[i] *= factor;
    }
  }

  /**
   * Sets the state object to represent a constant color segment with the
   * given color during a given duration.
   *
   * Returns the state object for easy chainability.
   */
  setToConstantColor(color: Color, duration: number): this {
    this.advanceTimeBy(duration);

    for (let i = 0; i < 3; i++) {
      this._startColor[i] = color[i];
    }

    return this;
  }

  /**
   * Sets the state object to represent a constant gray segment with the
   * given color during a given duration.
   *
   * Returns the state object for easy chainability.
   */
  setToConstantGray(grayLevel: number, duration: number): this {
    this.advanceTimeBy(duration);

    for (let i = 0; i < 3; i++) {
      this._startColor[i] = grayLevel;
    }

    return this;
  }
}

/**
 * Creates a generator function that executes commands from the given light
 * program (provided as a base64-encoded string, an ArrayBuffer or an Uint8Array)
 * and yields the state object for every relevant timestamp.
 */
function createLightProgramExecutor(
  program: LightProgramLike,
  initialState: ExecutorState | undefined = undefined
): LightProgramExecutor {
  const bytes = convertLightProgramToUint8Array(program);
  const numberBytes = bytes.length;
  const loops: LoopItem[] = [];
  let index: number;
  let state: ExecutorState;

  function reset() {
    index = 0;
    loops.length = 0;
    state = initialState ? initialState.copy() : new ExecutorState();
  }

  function getNextByte() {
    const byte = bytes[index];
    index++;
    return byte;
  }

  function getNextVaruint() {
    let value = 0;
    let shift = 0;
    let byte = 255;

    while (byte >= 128) {
      byte = bytes[index++];
      if (byte === undefined) {
        throw new Error('Bytecode ended while reading varuint');
      }

      // eslint-disable-next-line no-bitwise
      value |= (byte & 0x7f) << shift;
      shift += 7;
    }

    return value;
  }

  function parseCommandCode() {
    return getNextByte() || 0 /* end */;
  }

  function parseColorInto(color: Color) {
    color[0] = getNextByte() || 0;
    color[1] = getNextByte() || 0;
    color[2] = getNextByte() || 0;
  }

  function parseDuration() {
    // Durations are in frames @ 50fps, we need milliseconds
    return getNextVaruint() * 20;
  }

  const parseTimestamp = parseDuration;

  // eslint-disable-next-line complexity
  function* execute() {
    const color: Color = [0, 0, 0];
    let duration: number;
    let grayLevel: number;
    let iterations: number;
    let loopItem: LoopItem | undefined;
    let newTimestamp: number;

    if (numberBytes === 0) {
      return;
    }

    while (true) {
      const command = parseCommandCode();

      if (command === 0 /* end */) {
        break;
      }

      duration = 0;

      switch (command) {
        case 1 /* nop */: {
          break;
        }

        case 2 /* sleep */: {
          duration = parseDuration();
          if (duration > 0) {
            state.advanceTimeBy(duration);
          }

          break;
        }

        case 3 /* wait until */: {
          newTimestamp = Math.max(state.endTime, parseTimestamp());
          duration = newTimestamp - state.endTime;
          if (duration > 0) {
            state.advanceTimeBy(duration);
            /* yes, this is correct */
            state.advanceTimeBy(0);
          }

          break;
        }

        case 4 /* set color */: {
          parseColorInto(color);
          duration = parseDuration();
          state.setToConstantColor(color, duration);
          break;
        }

        case 5 /* set gray */: {
          grayLevel = getNextByte() || 0;
          duration = parseDuration();
          state.setToConstantGray(grayLevel, duration);
          break;
        }

        case 6 /* set black */: {
          duration = parseDuration();
          state.setToConstantGray(0, duration);
          break;
        }

        case 7 /* set white */: {
          duration = parseDuration();
          state.setToConstantGray(255, duration);
          break;
        }

        case 8 /* fade to color */: {
          parseColorInto(color);
          duration = parseDuration();
          state.fadeToColor(color, duration);
          break;
        }

        case 9 /* fade to gray */: {
          grayLevel = getNextByte() || 0;
          duration = parseDuration();
          state.fadeToGray(grayLevel, duration);
          break;
        }

        case 10 /* fade to black */: {
          duration = parseDuration();
          state.fadeToGray(0, duration);
          break;
        }

        case 11 /* fade to white */: {
          duration = parseDuration();
          state.fadeToGray(255, duration);
          break;
        }

        case 12 /* loop begin */: {
          iterations = getNextByte();
          loops.push([
            index,
            iterations > 0 ? iterations : Number.POSITIVE_INFINITY,
          ]);
          break;
        }

        case 13 /* loop end */: {
          loopItem = loops[loops.length - 1];
          if (!loopItem) {
            throw new Error('Found end loop command when loop stack is empty');
          }

          loopItem[1]--;
          if (loopItem[1]) {
            index = loopItem[0];
          } else {
            loops.pop();
          }

          break;
        }

        case 20 /* set pyro */:
        case 21 /* set pyro all */: {
          // just reaed the next byte that belongs to the channel, but don't
          // do anything with it
          getNextByte();
          break;
        }

        default: {
          throw new Error(
            'Unknown command in light program: ' + String(command)
          );
        }
      }

      if (duration > 0) {
        yield state;
      }
    }
  }

  reset();

  return {
    execute,
    reset,
  };
}

/**
 * Factory function that creates a new light program player object with a
 * single `evaluateColorAt()` function that evaluates the color at a given
 * timestamp, specified in seconds.
 */
export default function createLightProgramPlayer(
  program: LightProgramLike
): LightProgramPlayer {
  const executor = createLightProgramExecutor(program);
  const slices: Denque<ExecutorState> = new Denque<ExecutorState>();
  const maxHistoryLength = 31;
  let lastSliceEndTime: number;
  let endReached: boolean;

  // eslint-disable-next-line @typescript-eslint/ban-types
  let sliceGenerator: Iterator<ExecutorState, void> | null = null;

  function storeNextSliceFromExecutor() {
    let slice: ExecutorState;

    if (sliceGenerator) {
      const { value, done } = sliceGenerator.next();

      if (done) {
        // No more slices
        slice = slices
          .peekBack()!
          .copy()
          .advanceTimeBy(Number.POSITIVE_INFINITY);
        sliceGenerator = null;
      } else {
        slice = value.copy();

        // Convert durations to seconds as the executor works with milliseconds
        // internally
        slice.timestamp /= 1000;
        slice.duration /= 1000;

        // Also scale colors down to the 0-1 range
        slice.scaleColorsBy(1 / 255);
      }

      if (slices.push(slice) > maxHistoryLength) {
        /* TODO(ntamas): the ExecutorState objects that we remove from the queue
         * here could be put aside and re-used later instead of creating a
         * new one */
        slices.shift();
      }

      lastSliceEndTime = slice.timestamp + slice.duration;
    }

    return !endReached;
  }

  /**
   * Returns the color of the light program at the given timestamp.
   *
   * The result is provided in an output argument to avoid allocations.
   *
   * @param  seconds  the timestamp
   * @param  color    the result will be returned here
   */
  function evaluateColorAt(seconds: number, color: Color) {
    let index: number;
    let slice: ExecutorState;

    if (!Number.isFinite(seconds)) {
      if (seconds < 0) {
        seconds = 0;
      } else {
        throw new TypeError('infinite timestamps not supported');
      }
    }

    // Do we need to rewind?
    const front = slices.peekFront();
    if (front && seconds < front.timestamp) {
      rewind();
    }

    // Fast-forward to the given timestamp and feed the event queue
    while (seconds >= lastSliceEndTime) {
      storeNextSliceFromExecutor();
    }

    // Optimize for the common case: the timestamp is almost always somewhere
    // in the last slice of event queue, so scan from the back
    index = slices.length - 1;
    while (index >= 0) {
      slice = slices.peekAt(index)!;
      if (slice.containsTime(seconds)) {
        break;
      }

      index--;
    }

    return slice!.evaluateColorAt(seconds, color);
  }

  /**
   * Iterator that evaluates the light program with the given number of frames
   * per second, yielding timestamp-color pairs.
   *
   * @param fps  the number of frames (evaluations) per second
   */
  function* iterate(fps = 25): Generator<[number, Color], void, void> {
    const dt: number = 1 / fps;
    const color: Color = [0, 0, 0];
    let [seconds, frames, t] = [0, 0, 0];

    // eslint-disable-next-line no-unmodified-loop-condition
    while (sliceGenerator) {
      evaluateColorAt(t, color);
      yield [t, color];
      t += dt;
      frames += 1;
      if (frames === fps) {
        seconds++;
        frames = 0;
        t = seconds;
      }
    }
  }

  /**
   * Rewinds the player to zero time.
   */
  function rewind() {
    slices.clear();
    slices.push(new ExecutorState());

    executor.reset();
    sliceGenerator = executor.execute();

    lastSliceEndTime = -1;
    endReached = false;
  }

  rewind();

  return {
    evaluateColorAt,
    iterate,
  };
}
