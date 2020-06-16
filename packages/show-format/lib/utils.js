/* global requestIdleCallback */

/**
 * Async function that blocks until the next idle cycle of the browser. Used to
 * ensure that the browser UI does not block when resolving references in the
 * show file.
 *
 * Resolves immediately in Node.js as there is no equivalent to requestIdleCallback()
 * there.
 */
const idle =
  typeof requestIdleCallback !== 'undefined' /* istanbul ignore next */
    ? async () => new Promise((resolve) => requestIdleCallback(resolve))
    : () => {};

module.exports = {
  idle
};
