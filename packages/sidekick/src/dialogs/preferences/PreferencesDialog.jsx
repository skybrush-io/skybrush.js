import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Tab from '@material-ui/core/Tab';
import DialogTabs from '@skybrush/mui-components/src/DialogTabs';

import { isPreferencesDialogVisible } from '~/features/ui/selectors';
import { closePreferencesDialog } from '~/features/ui/slice';

import CommandsTab from './CommandsTab';
import DisplayTab from './DisplayTab';

const PreferencesDialog = ({ open, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('display');
  return (
    <Dialog fullWidth maxWidth='sm' open={open} onClose={onClose}>
      <DialogTabs
        alignment='center'
        value={selectedTab}
        onChange={(_event, newValue) => setSelectedTab(newValue)}
      >
        <Tab value='display' label='Display' />
        <Tab value='commands' label='Commands' />
      </DialogTabs>
      <DialogContent>
        {selectedTab === 'display' && <DisplayTab />}
        {selectedTab === 'commands' && <CommandsTab />}
      </DialogContent>
    </Dialog>
  );
};

PreferencesDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default connect(
  // mapStateToProps
  (state) => ({
    open: isPreferencesDialogVisible(state),
  }),
  // mapDispatchToProps
  {
    onClose: closePreferencesDialog,
  }
)(PreferencesDialog);
