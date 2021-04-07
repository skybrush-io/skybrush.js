import React from 'react';

import ConfirmationDialog from './ConfirmationDialog';
import OutputDeviceDialog from './output-device/OutputDeviceDialog';
import PreferencesDialog from './preferences/PreferencesDialog';

const DialogsContainer = () => (
  <>
    <OutputDeviceDialog />
    <PreferencesDialog />
    <ConfirmationDialog />
  </>
);

export default DialogsContainer;
