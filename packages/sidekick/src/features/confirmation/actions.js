import { getActionToConfirm } from './selectors';
import { clearConfirmation } from './slice';

export { requestConfirmation } from './slice';

export function confirm() {
  return (dispatch, getState) => {
    const actionToConfirm = getActionToConfirm(getState());

    dispatch(clearConfirmation());

    if (actionToConfirm) {
      dispatch(actionToConfirm);
    }
  };
}

export const reject = clearConfirmation;
