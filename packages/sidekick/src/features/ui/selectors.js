export const getSelectedUAVId = (state) => {
  return state.ui.selectedUAVId;
};

export const getSidebarWidth = (state) => {
  const width = state.ui.sidebarWidth;
  if (typeof width !== 'number' || width <= 0) {
    return 240;
  }

  return width;
};

export const isOutputDeviceDialogVisible = (state) =>
  state.ui.outputDeviceDialog.visible;

export const isPreferencesDialogVisible = (state) =>
  state.ui.preferencesDialog.visible;
