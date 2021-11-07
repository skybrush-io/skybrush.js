import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { styled } from '@mui/material/styles';
import { Colors, Status } from '@skybrush/app-theme-mui';
import SemanticAvatar from '@skybrush/mui-components/src/SemanticAvatar';

import { getUAVStateById } from '~/features/uavs/selectors';
import { getSelectedUAVId } from '~/features/ui/selectors';
import { setSelectedUAVId } from '~/features/ui/slice';

const StyledDiv = styled('div', {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'inactive',
})(({ inactive, selected, theme }) => ({
  /*
  // Transition turned off because it is hard to follow where the selection
  // is when the user is holding down a keyboard navigation key
  transition: theme.transitions.create(['background-color']),
  */
  backgroundColor: selected ? Colors.info : 'none',

  '&:hover': {
    backgroundColor: selected ? Colors.info : theme.palette.action.hover,
  },

  opacity: inactive ? 0.5 : 1,
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

const DroneButton = ({ id, item, selected, ...rest }) => (
  <StyledDiv
    inactive={!item || (!item.active && item.errorCode !== 0)}
    selected={selected}
    {...rest}
  >
    <SemanticAvatar status={statusForItem(item)}>{id}</SemanticAvatar>
  </StyledDiv>
);

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
