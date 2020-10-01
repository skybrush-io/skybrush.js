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

module.exports = {
  idle
};
