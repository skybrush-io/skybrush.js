import * as localForage from 'localforage';
import type { PersistConfig } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { createBlacklistFilter } from 'redux-persist-transform-filter';

export type StorageConfig<S, RS = any, HSS = any, ESS = any> = Omit<
  PersistConfig<S, RS, HSS, ESS>,
  'blacklist' | 'storage'
> & {
  blacklist?: string | string[];
};

/**
 * Creates a configuration object that is suitable for `redux-persist` to
 * store the application state.
 *
 * In the browser, we store the state in the browser's local storage using
 * `localforage`.
 *
 * In the Electron version, we store the state in a separate JSON file using
 * `electron-store`.
 *
 * @param {string}   key        a unique key identifying the Skybrush application
 * @param {number}   version    version number for the state storage schema
 * @param {string[]} blacklist  list of state paths (top-level and non-top-level alike)
 *        to remove from the stored state
 */
export function createStorageConfiguration<S, RS, HSS, ESS>({
  key,
  version,
  blacklist,
  transforms,
  ...rest
}: StorageConfig<S, RS, HSS, ESS>) {
  if (!key) {
    throw new Error(
      'You must provide a key for the storage configuration object'
    );
  }

  if (!version) {
    throw new Error(
      'You must provide a storage schema version number for the storage configuration object'
    );
  }

  // Convert blacklist entries with dotted paths to the appropriate blacklist
  // filters
  if (!transforms) {
    transforms = [];
  }

  if (typeof blacklist === 'string') {
    blacklist = [blacklist];
  } else if (!blacklist) {
    blacklist = [];
  } else if (!Array.isArray(blacklist)) {
    throw new TypeError('blacklist must be an array or a string');
  }

  const dottedPaths = blacklist.filter((item) => item.includes('.'));
  blacklist = blacklist.filter((item) => !item.includes('.'));

  const dottedPathsByPrefixes: Record<string, string[]> = {};
  for (const path of dottedPaths) {
    const index = path.indexOf('.');
    const head = path.slice(0, Math.max(0, index));
    const tail = path.slice(index + 1);
    if (tail.includes('.')) {
      throw new Error(
        'dotted paths with more than two components not supported yet'
      );
    }

    if (dottedPathsByPrefixes[head] === undefined) {
      dottedPathsByPrefixes[head] = [];
    }

    dottedPathsByPrefixes[head].push(tail);
  }

  for (const [path, keys] of Object.entries(dottedPathsByPrefixes)) {
    transforms.push(createBlacklistFilter(path, keys));
  }

  const storage: PersistConfig<S, RS, HSS, ESS>['storage'] =
    'bridge' in window && (window as any)?.bridge
      ? (
          (window as any).bridge.createStateStore as () => PersistConfig<
            S,
            RS,
            HSS,
            ESS
          >['storage']
        )()
      : localForage;

  return {
    key,
    version,

    storage,
    stateReconciler: autoMergeLevel2,

    // Do not save more frequently than once every second
    throttle: 1000 /* msec */,

    blacklist,
    transforms,

    ...rest,
  };
}
