import { configureStoreAndPersistence } from './store';

export {
  chooseUniqueId,
  chooseUniqueName,
  chooseUniqueIdFromName,
} from './naming';
export { createStorageConfiguration } from './persistence';
export { configureStoreAndPersistence } from './store';
export { isAllowedInRedux } from './utils';

export default configureStoreAndPersistence;
