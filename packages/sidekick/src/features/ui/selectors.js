export const getSidebarWidth = (state) => {
  const width = state.ui.sidebarWidth;
  if (typeof width !== 'number' || width <= 0) {
    return 240;
  }

  return width;
};

export const isPreferencesDialogVisible = (state) =>
  state.ui.preferencesDialog.visible;
