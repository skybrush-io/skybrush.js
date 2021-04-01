import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import ThemeSelector from '@skybrush/mui-components/lib/ThemeSelector';

import { getTheme } from '~/features/settings/selectors';
import { setTheme } from '~/features/settings/slice';

import UAVIdSpecificationEditor from './UAVIdSpecificationEditor';

const DisplayTab = ({ onFieldChanged, theme }) => (
  <Box>
    <Box py={2}>
      <ThemeSelector value={theme} onChange={onFieldChanged} />
    </Box>

    <Box pb={2}>
      <UAVIdSpecificationEditor />
    </Box>
  </Box>
);

DisplayTab.propTypes = {
  onFieldChanged: PropTypes.func,
  theme: PropTypes.string,
};

export default connect(
  // mapStateToProps
  (state) => ({
    theme: getTheme(state),
  }),
  // mapDispatchToProps
  {
    onFieldChanged: (event) => setTheme(event.target.value),
  }
)(DisplayTab);
