/**
 * @file Function for processing a Skybrush compiled show file.
 */

// eslint-disable-next-line unicorn/prefer-node-protocol
import { Buffer } from 'buffer';

import type {
  FileInfo,
  Options,
  ResolverOptions,
} from '@apidevtools/json-schema-ref-parser';
import RefParser from '@apidevtools/json-schema-ref-parser';
import JSZip from 'jszip';

import Asset from './asset.js';
import type { ShowSpecification } from './types.js';
import { idle } from './utils.js';
import { validateShowSpecification } from './validation.js';

/**
 * Helper function that returns whether a given file is likely to be data
 * (in JSON or YAML format) or a binary asset.
 */
const isBinaryAsset = (file: FileInfo) =>
  file.extension !== '.json' && file.extension !== '.yaml';

/**
 * Dummy resolver that prevents binary assets from being loaded.
 *
 * This must have a lower order number than the "real" resolver.
 */
const dummyAssetResolver: ResolverOptions = {
  order: 1,
  canRead: (file) => file.url.startsWith('zip:') && isBinaryAsset(file),
  read: (file) => new Asset(file.url.slice('zip:'.length)),
};

/**
 * Helper function that creates a JSONRef resolver that resolves references
 * from a given ZIP file.
 *
 * @param zip  the JSZip object representing the ZIP file in which the
 *        references are resolved
 */
function createZIPResolver(zip: JSZip): ResolverOptions {
  return {
    order: 2,

    canRead: /^zip:/,

    async read(file) {
      const url = new URL(decodeURI(file.url));

      /* istanbul ignore if */
      if (url.protocol !== 'zip:') {
        throw new Error(`unsupported protocol: ${url.protocol}`);
      }

      // In a browser environment, wait a bit so we don't hog the UI thread
      // with the parsing work.
      await idle();

      // Use strings only for JSON and YAML files; use uint8 arrays for
      // other embedded assets
      return zip
        .file(url.pathname)!
        .async(isBinaryAsset(file) ? 'uint8array' : 'string');
    },
  };
}

/**
 * Loads a drone show from a file.
 *
 * @param  file  The file to load; can be an array of bytes, an
 *         ArrayBuffer, an Uint8Array, a Buffer, a Blob or a Node.js
 *         readable stream.
 * @param  options.assets  Whether to load assets from the compiled show file.
 *         Defaults to `false` because it can be time- and memory-consuming.
 * @return Object containing the parsed show specification and the loaded
 *         `JSZip` content.
 */
export async function loadShowSpecificationAndZip(
  file: string | number[] | Uint8Array | ArrayBuffer | Blob,
  options: { assets?: boolean } = {}
): Promise<{ showSpec: ShowSpecification; zip: JSZip }> {
  const { assets = false } = options;
  const zip = await JSZip.loadAsync(file);

  // Create a JSON reference to the main show specification file and then
  // let the JSONRef parser handle the rest
  const root = { $ref: 'zip:show.json' };

  // Configure the parsers. This is static; we simply extend the binary
  // parser not to check the extension of the file that we are about to parse.
  const parsers: Options['parse'] = {
    binary: {
      canParse: (file: FileInfo) => Buffer.isBuffer(file.data),
    } as any,
  };

  // Configure the resolvers. If we want to prevent the loading of the assets,
  // we have to catch them early in the resolving phase so we don't even
  // attempt extracting them from the ZIP.
  const resolvers: Options['resolve'] = {
    zip: createZIPResolver(zip),
  };

  if (!assets) {
    resolvers.dummy = dummyAssetResolver;
  }

  // Resolve all $ref references in the show specification
  const showSpec = await RefParser.dereference(root, {
    parse: parsers,
    resolve: resolvers,
  });

  validateShowSpecification(showSpec);

  return { showSpec, zip };
}

/**
 * Loads a drone show specification from a file.
 *
 * @param  file  The file to load; can be an array of bytes, an
 *         ArrayBuffer, an Uint8Array, a Buffer, a Blob or a Node.js
 *         readable stream
 * @param  options.assets  Whether to load assets from the compiled show file.
 *         Defaults to false because it can be time- and memory-consuming.
 * @return The parsed show specification.
 */
async function loadCompiledShow(
  file: string | number[] | Uint8Array | ArrayBuffer | Blob,
  options: { assets?: boolean } = {}
): Promise<ShowSpecification> {
  const { showSpec } = await loadShowSpecificationAndZip(file, options);
  return showSpec;
}

export default loadCompiledShow;
