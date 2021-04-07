import isNil from 'lodash-es/isNil';

export function getActionToConfirm(state) {
  return state.confirmation.actionToConfirm;
}

export function getConfirmationMessage(state) {
  return state.confirmation.message;
}

export function getConfirmationTitle(state) {
  return state.confirmation.title;
}

export function hasPendingConfirmation(state) {
  return !isNil(state.confirmation.actionToConfirm);
}
