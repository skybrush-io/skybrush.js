import { connect } from 'react-redux';

import PreventDisplaySleep from '@skybrush/mui-components/src/PreventDisplaySleep';

import { isServerConnectionActive } from '~/features/input/selectors';
import { hasOutputDevice } from '~/features/output/selectors';

export default connect(
  // mapStateToProps
  (state) => ({
    active: isServerConnectionActive(state) || hasOutputDevice(state),
  }),
  // mapDispatchToProps
  {}
)(PreventDisplaySleep);
