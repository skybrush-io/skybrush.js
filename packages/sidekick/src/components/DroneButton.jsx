import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Status } from '@skybrush/app-theme-material-ui';
import SemanticAvatar from '@skybrush/mui-components/src/SemanticAvatar';

import { getSelectedUAVId } from '~/features/ui/selectors';
import { setSelectedUAVId } from '../features/ui/slice';

const DroneButton = ({ id, selected, ...rest }) => {
  console.log('Re-rendering', id);
  return (
    <div {...rest}>
      <SemanticAvatar status={selected ? Status.NEXT : Status.OFF}>
        {id}
      </SemanticAvatar>
    </div>
  );
};

DroneButton.propTypes = {
  id: PropTypes.number,
  selected: PropTypes.bool,
};

export default connect(
  // mapStateToProps
  (_state, ownProps) => {
    const { id } = ownProps;
    return (state) => ({
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
