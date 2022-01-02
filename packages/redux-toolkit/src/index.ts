import { configureStoreAndPersistence } from './store';

export {
  chooseUniqueId,
  chooseUniqueName,
  chooseUniqueIdFromName,
} from './naming';
export { createStorageConfiguration, StorageConfig } from './persistence';
export {
  configureStoreAndPersistence,
  StoreAndPersistenceConfig,
} from './store';
export { isAllowedInRedux, noPayload, stripEvent } from './utils';

export default configureStoreAndPersistence;
