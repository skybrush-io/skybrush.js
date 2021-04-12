import {
  setSelectedTabInPreferencesDialog,
  setSelectedUAVId,
  showPreferencesDialog,
} from './slice';

export function clearSelectedUAVId() {
  return setSelectedUAVId(null);
}

export function showPreferencesDialogWithSelectedTab(tab) {
  return (dispatch) => {
    dispatch(setSelectedTabInPreferencesDialog(tab));
    dispatch(showPreferencesDialog());
  };
}
