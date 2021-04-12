import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Tab from '@material-ui/core/Tab';
import DialogTabs from '@skybrush/mui-components/src/DialogTabs';

import {
  getSelectedTabInPreferencesDialog,
  isPreferencesDialogVisible,
} from '~/features/ui/selectors';
import {
  closePreferencesDialog,
  setSelectedTabInPreferencesDialog,
} from '~/features/ui/slice';

import CommandsTab from './CommandsTab';
import DisplayTab from './DisplayTab';
import ServerTab from './ServerTab';

const PreferencesDialog = ({
  open,
  onClose,
  onSetSelectedTab,
  selectedTab,
}) => (
  <Dialog fullWidth maxWidth='sm' open={open} onClose={onClose}>
    <DialogTabs
      alignment='center'
      value={selectedTab}
      onChange={(_event, newValue) => onSetSelectedTab(newValue)}
    >
      <Tab value='display' label='Display' />
      <Tab value='commands' label='Commands' />
      <Tab value='server' label='Server' />
    </DialogTabs>
    <DialogContent>
      {selectedTab === 'display' && <DisplayTab />}
      {selectedTab === 'commands' && <CommandsTab />}
      {selectedTab === 'server' && <ServerTab />}
    </DialogContent>
  </Dialog>
);

PreferencesDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSetSelectedTab: PropTypes.func,
  selectedTab: PropTypes.oneOf(['display', 'commands', 'server']),
};

PreferencesDialog.defaultProps = {
  selectedTab: 'display',
};

export default connect(
  // mapStateToProps
  (state) => ({
    open: isPreferencesDialogVisible(state),
    selectedTab: getSelectedTabInPreferencesDialog(state),
  }),
  // mapDispatchToProps
  {
    onClose: closePreferencesDialog,
    onSetSelectedTab: setSelectedTabInPreferencesDialog,
  }
)(PreferencesDialog);
