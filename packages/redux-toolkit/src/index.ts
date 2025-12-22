import type { StorageConfig as StorageConfig_ } from './persistence.js';
import type { StoreAndPersistenceConfig as StoreAndPersistenceConfig_ } from './store.js';
import { configureStoreAndPersistence } from './store.js';

export { createSelectionHandlerThunk } from './actions.js';
export {
  chooseUniqueId,
  chooseUniqueIdFromName,
  chooseUniqueName,
} from './naming.js';
export { createStorageConfiguration } from './persistence.js';
export { configureStoreAndPersistence } from './store.js';
export type {
  SelectionHandlerReduxFunctions,
  SelectionHandlerThunk,
} from './types.js';
export { isAllowedInRedux, noPayload, stripEvent } from './utils.js';

export type StorageConfig<S, RS = any, HSS = any, ESS = any> = StorageConfig_<
  S,
  RS,
  HSS,
  ESS
>;
export type StoreAndPersistenceConfig = StoreAndPersistenceConfig_;

export default configureStoreAndPersistence;
