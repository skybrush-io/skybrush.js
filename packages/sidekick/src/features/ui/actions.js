import { setSelectedUAVId } from './slice';

export function clearSelectedUAVId() {
  return setSelectedUAVId(null);
}
