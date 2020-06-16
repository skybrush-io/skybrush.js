/**
 * @file Function for processing a Skybrush compiled show file.
 */

/* global requestIdleCallback */

const RefParser = require('@apidevtools/json-schema-ref-parser');
const JSZip = require('jszip');

const {validateShowSpecification} = require('./validation');

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

/**
 * Helper function that creates a JSONRef resolver that resolves references
 * from a given ZIP file.
 *
 * @param {JSZip} zip  the JSZip object representing the ZIP file in which the
 *        references are resolved
 */
function createZIPResolver(zip) {
  return {
    order: 1,

    canRead: /^zip:/,

    async read(file) {
      const url = new URL(file.url);
      /* istanbul ignore if */
      if (url.protocol !== 'zip:') {
        throw new Error(`unsupported protocol: ${url.protocol}`);
      }

      await idle();

      // TODO(ntamas): use strings only for JSON and YAML files; use some binary
      // encoding for embedded assets
      return zip.file(url.pathname).async('string');
    }
  };
}

/**
 * Loads a drone show from a file.
 *
 * @param  {object}  file  the file to load; can be an array of bytes, an
 *         ArrayBuffer, an Uint8Array, a Buffer, a Blob or a promise resolving
 *         to these
 * @return {object} the parsed show specification
 */
async function loadCompiledShow(file) {
  const zip = await JSZip.loadAsync(file);

  // Create a JSON reference to the main show specification file and then
  // let the JSONRef parser handle the rest
  const root = {$ref: 'zip:show.json'};

  // Resolve all $ref references in the show specification
  const showSpec = await RefParser.dereference(root, {
    resolve: {
      zip: {
        ...createZIPResolver(zip)
      }
    }
  });

  validateShowSpecification(showSpec);

  return showSpec;
}

module.exports = loadCompiledShow;
