const setImmediate = require('core-js-pure/features/set-immediate');

/**
 * Async function that blocks until the next idle cycle of the browser or the
 * Node environment. Used to ensure that the browser UI does not block when
 * resolving references in the show file.
 */
const idle = () =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

const isNil = (x) => x === null || x === undefined;

function shuffle(array, rng = Math.random) {
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

module.exports = {
  idle,
  isNil,
  shuffle,
};
