import React from 'react';
import { connect } from 'react-redux';
import SettingsIcon from '@material-ui/icons/Settings';

import GenericHeaderButton from '@skybrush/mui-components/lib/GenericHeaderButton';

import { showPreferencesDialog } from '~/features/ui/slice';

const PreferencesButton = (props) => (
  <GenericHeaderButton tooltip='Preferences' {...props}>
    <SettingsIcon />
  </GenericHeaderButton>
);

export default connect(
  // mapStateToProps
  () => {},
  // mapDispatchToProps
  {
    onClick: showPreferencesDialog,
  }
)(PreferencesButton);
