/**
 * Async function that blocks until the next idle cycle of the browser or the
 * Node environment. Used to ensure that the browser UI does not block when
 * resolving references in the show file.
 */
export const idle = async () =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

// eslint-disable-next-line @typescript-eslint/ban-types
export function isNil(x: any): x is null | undefined {
  return x === null || x === undefined;
}

/**
 * Type guard that returns whether x is a JavaScript object with keys and
 * values.
 */
export function isObject(x: any): x is Record<string, unknown> {
  return !isNil(x) && typeof x === 'object' && !Array.isArray(x);
}

/**
 * Type guard that checks whether x is an ArrayBuffer.
 */
export function isArrayBuffer(x: any): x is ArrayBuffer {
  return (
    x instanceof ArrayBuffer || toString.call(x) === '[object ArrayBuffer]'
  );
}

/**
 * Shuffles an array in-place. Returns the same array for easy chaining.
 */
export function shuffle<T>(array: T[], rng = Math.random): T[] {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(rng() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
