import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Tab from '@material-ui/core/Tab';
import DialogTabs from '@skybrush/mui-components/src/DialogTabs';

import { isPreferencesDialogVisible } from '~/features/ui/selectors';
import { closePreferencesDialog } from '~/features/ui/slice';

const PreferencesDialog = ({ open, onClose }) => (
  <Dialog fullWidth maxWidth='sm' open={open} onClose={onClose}>
    <DialogTabs alignment='center' value='display'>
      <Tab value='display' label='Display' />
    </DialogTabs>
    <DialogContent>
      <div>Foobar</div>
    </DialogContent>
  </Dialog>
);

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
