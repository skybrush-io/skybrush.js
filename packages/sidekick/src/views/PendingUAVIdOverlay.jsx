import isNil from 'lodash-es/isNil';
import { connect } from 'react-redux';

import QuickSelectionOverlay from '@skybrush/mui-components/src/QuickSelectionOverlay';

import { getPendingUAVId } from '~/features/keyboard/selectors';

export default connect(
  // mapStateToProps
  (state) => {
    const id = getPendingUAVId(state);
    return {
      text: id,
      open: !isNil(id),
    };
  },
  // mapDispatchToProps
  {}
)(QuickSelectionOverlay);
