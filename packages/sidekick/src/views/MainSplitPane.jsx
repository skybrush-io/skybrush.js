import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';

import { getSidebarWidth } from '~/features/ui/selectors';
import { setSidebarWidth } from '~/features/ui/slice';

import DroneButtonGrid from './DroneButtonGrid';

const MainSplitPane = ({ onSidebarResized, sidebarWidth }) => (
  <SplitPane
    primary='second'
    split='vertical'
    minSize={80}
    defaultSize={sidebarWidth}
    onDragFinished={onSidebarResized}
  >
    <DroneButtonGrid />
    <div>B</div>
  </SplitPane>
);

MainSplitPane.propTypes = {
  onSidebarResized: PropTypes.func,
  sidebarWidth: PropTypes.number,
};

export default connect(
  // mapStateToProps
  (state) => ({
    sidebarWidth: getSidebarWidth(state),
  }),
  // mapDispatchToProps
  {
    onSidebarResized: setSidebarWidth,
  }
)(MainSplitPane);
