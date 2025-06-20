import type { StorageConfig as StorageConfig_ } from './persistence';
import { configureStoreAndPersistence } from './store';
import type { StoreAndPersistenceConfig as StoreAndPersistenceConfig_ } from './store';

export { createSelectionHandlerThunk } from './actions';
export {
  chooseUniqueId,
  chooseUniqueName,
  chooseUniqueIdFromName,
} from './naming';
export { createStorageConfiguration } from './persistence';
export { configureStoreAndPersistence } from './store';
export { isAllowedInRedux, noPayload, stripEvent } from './utils';

export type StorageConfig<S, RS = any, HSS = any, ESS = any> = StorageConfig_<
  S,
  RS,
  HSS,
  ESS
>;
export type StoreAndPersistenceConfig = StoreAndPersistenceConfig_;

export default configureStoreAndPersistence;
