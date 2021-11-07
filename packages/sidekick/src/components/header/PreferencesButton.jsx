import React from 'react';
import { connect } from 'react-redux';
import SettingsIcon from '@mui/icons-material/Settings';

import GenericHeaderButton from '@skybrush/mui-components/src/GenericHeaderButton';

import { showPreferencesDialog } from '~/features/ui/slice';

const PreferencesButton = (props) => (
  <GenericHeaderButton tooltip='Preferences' {...props}>
    <SettingsIcon />
  </GenericHeaderButton>
);

export default connect(
  // mapStateToProps
  null,
  // mapDispatchToProps
  {
    onClick: showPreferencesDialog,
  }
)(PreferencesButton);
