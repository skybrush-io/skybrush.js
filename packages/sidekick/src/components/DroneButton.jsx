import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';

import { Colors, Status } from '@skybrush/app-theme-material-ui';
import SemanticAvatar from '@skybrush/mui-components/src/SemanticAvatar';

import { getUAVStateById } from '~/features/uavs/selectors';
import { getSelectedUAVId } from '~/features/ui/selectors';
import { setSelectedUAVId } from '~/features/ui/slice';

const useStyles = makeStyles((theme) => ({
  root: {
    /*
    // Transition turned off because it is hard to follow where the selection
    // is when the user is holding down a keyboard navigation key
    transition: theme.transitions.create(['background-color']),
    */
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },

  selected: {
    backgroundColor: Colors.info,
    '&:hover': {
      backgroundColor: Colors.info,
    },
  },

  inactive: {
    opacity: 0.5,
  },
}));

const statusForItem = (item) => {
  if (item.errorCode === 0) {
    return item.active ? Status.SUCCESS : Status.OFF;
  }

  if (item.errorCode >= 192) {
    return Status.CRITICAL;
  }

  if (item.errorCode >= 128) {
    return Status.ERROR;
  }

  if (item.errorCode >= 64) {
    return Status.WARNING;
  }

  return Status.INFO;
};

const DroneButton = ({ id, item, selected, ...rest }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(
        classes.root,
        (!item || (!item.active && item.errorCode !== 0)) && classes.inactive,
        selected && classes.selected
      )}
      {...rest}
    >
      <SemanticAvatar status={statusForItem(item)}>{id}</SemanticAvatar>
    </div>
  );
};

DroneButton.propTypes = {
  id: PropTypes.number,
  item: PropTypes.shape({
    active: PropTypes.bool,
    errorCode: PropTypes.number,
  }),
  selected: PropTypes.bool,
};

export default connect(
  // mapStateToProps
  (_state, ownProps) => {
    const { id } = ownProps;
    return (state) => ({
      item: getUAVStateById(state, id),
      selected: getSelectedUAVId(state) === id,
    });
  },
  // mapDispatchToProps
  (_dispatch, ownProps) => {
    const { id } = ownProps;
    return (dispatch) => ({
      onClick: () => dispatch(setSelectedUAVId(id)),
    });
  }
)(DroneButton);
